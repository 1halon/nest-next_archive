import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, Injectable } from '@nestjs/common';
import { compareSync, hashSync } from 'bcrypt';
import { randomUUID } from 'crypto';
import { generate } from 'generate-password';
import { Response, Request } from 'express';

export interface LoginDto {
    email?: string;
    token: string;
    username: string;
}

export interface ConfirmationRequest {
    args: any[];
    exp: number;
    handle: RequestHandler;
    hash: string;
    iat: number;
    id: string;
    identifier: string;
    self_destruct: NodeJS.Timeout;
    type: RequestTypes;
    token: string;
    username: string;
    confirm(pass: string): boolean;
    resolve(): void;
}

export type RequestTypes = 'LOGIN' | 'REGISTER';
export type RequestHandler = (request: ConfirmationRequest) => Promise<(req: Request, res: Response) => void>;
export const RequestTimeout = 5 * 60 * 1e3;

@Injectable()
export class AuthServiceV1 {
    constructor(
        private readonly mailerService: MailerService
    ) { };

    public readonly salt = process.env.HASH_SALT;
    public readonly confirmation_requests = {} as Record<string, ConfirmationRequest>;

    private static readonly RequestHandlers = {
        async 'LOGIN'(request: ConfirmationRequest) {
            return function (req: Request, res: Response) {
                const payload = {
                    id: request.id,
                    identifier: req.identifier.toString(),
                    userid: request.args[0].id,
                    username: request.username
                }, token = this.jwtService.sign(payload);
                res.cookie('token', token, {
                    httpOnly: true,
                    sameSite: 'strict',
                    secure: true,
                    signed: true
                }).send(payload);
            }
        },
        async 'REGISTER'(request: ConfirmationRequest) {
            return function (req: Request, res: Response) {
                const { hash, pass } = this.authService.createTempPass(64),
                    userModel = Object.assign(request.args[0], { token: hash });
                new this.userService.userModel(userModel).save().then(function () {
                    res.send(pass);
                }).catch(() => res.writeHead(400).send());
            }
        },
    } as Record<RequestTypes, RequestHandler>;
    private static readonly RequestTimeout = 5 * 60 * 1e3;

    createRequest(type: RequestTypes, username: string, identifier: string, args?: any[]) {
        const ex_requests = Object.values(this.confirmation_requests).filter(request => request.username === username);
        if (type === 'REGISTER' && ex_requests.findIndex(request => request.type === 'REGISTER') !== -1)
            throw new Error('CONFIRMATION_IN_PROGRESS');
        else if (type === 'LOGIN' && ex_requests.filter(request => request.identifier === identifier).length > 5)
            throw new Error('RATE_LIMITED');

        const iat = Date.now(),
            id = randomUUID().split('-').join(''),
            { hash, pass } = this.createTempPass(),
            token = Buffer.from(`${id}-${pass}`).toString('base64'),
            request = {
                args: args ?? [],
                exp: iat + AuthServiceV1.RequestTimeout,
                hash,
                iat,
                id,
                identifier: identifier,
                self_destruct: null,
                type,
                token,
                username,
                confirm: pass => compareSync(pass, hash),
                handle: AuthServiceV1.RequestHandlers[type],
                resolve: () => {
                    clearTimeout(this.confirmation_requests[id]?.self_destruct);
                    delete this.confirmation_requests[id];
                },
            } as ConfirmationRequest;

        request.self_destruct = setTimeout(() => request.resolve(), AuthServiceV1.RequestTimeout);
        this.confirmation_requests[id] = request;

        return request;
    }

    createTempPass(length?: number) {
        const pass = generate({ length: length ?? 32, lowercase: true, numbers: true, strict: true, symbols: false, uppercase: true }),
            hash = hashSync(pass, this.salt);
        return { hash, pass };
    }
}
