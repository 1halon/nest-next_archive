import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { compareSync, hashSync } from 'bcrypt';
import { randomUUID } from 'crypto';
import { TemplateFunction } from 'ejs';
import { generate } from 'generate-password';

export interface LoginDto {
    email: string;
    token: string;
    username: string;
}

export interface PendingRequest {
    args: any[];
    expiresAt: number;
    id: string;
    self_destruct: NodeJS.Timeout;
    type: RequestTypes;
    username: string;
    confirm(pass: string): boolean;
    resolve();
}

export type RequestTypes = 'CREATE' | 'LOGIN';

@Injectable()
export class AuthServiceV1 {
    constructor(
        private readonly mailerService: MailerService
    ) { }
    public readonly salt = process.env.HASH_SALT;
    public readonly pending_requests = Array<PendingRequest>();

    createRequest(type: RequestTypes, username: string, hash: string, args?: any[]) {
        const RequestTypes = this.pending_requests.findIndex(request => request.type === type && request.username === username);
        if (type === 'CREATE' && RequestTypes !== -1) throw new Error('REQUEST_IN_PROGRESS');
        else if (type === 'LOGIN') this.pending_requests.splice(RequestTypes, 1);
        const id = randomUUID(); this.pending_requests.push({
            args: args ?? [],
            expiresAt: Date.now() + 5 * 60 * 1000,
            id,
            self_destruct: setTimeout(function () { this.resolve(); }, 5 * 60 * 1000),
            type,
            username,
            confirm: pass => compareSync(pass, hash),
            resolve: () => {
                const index = this.pending_requests.findIndex(request => request.id === id); if (index === -1) return;
                clearTimeout(this.pending_requests[index].self_destruct); this.pending_requests.splice(index, 1);
            },
        } as PendingRequest);
        return id;
    }

    async sendRequest(type: RequestTypes, username: string, mail_template: TemplateFunction, email: string, args?: any[]) {
        const { hash, pass } = this.createTempPass(),
            id = this.createRequest(type, username, hash, args);
        console.log('REQUEST | TYPE:', type, '| USERNAME:', username, '| TOKEN:', Buffer.from(`${id}-${pass}`).toString('base64'));
        /*await this.mailerService.sendMail({
            html: mail_template({ id, pass }),
            subject: 'Confirm Your Action',
            to: email
        }).catch(() => { throw new Error('Bad Request'); });*/
        return id;
    }

    createTempPass(length?: number) {
        const pass = generate({ length: length ?? 32, lowercase: true, numbers: true, strict: true, symbols: false, uppercase: true }),
            hash = hashSync(pass, this.salt);
        return { hash, pass };
    }
}
