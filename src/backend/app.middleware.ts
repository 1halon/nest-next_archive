import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AppMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        req.identifier = {
            agent: {
                browser: req.useragent.browser,
                os: req.useragent.os,
                version: req.useragent.version,
                toJSON(text: string) {
                    const [bv, os] = text.split('-'),
                        [browser, version] = bv.split('/');

                    return { browser, os: os.trim(), version: version.trim() };
                },
                toString() { return `${this.browser}/${this.version} - ${this.os}`; }
            },
            clientIP: req.clientIp,
            ip: req.ip,
            toJSON(text: string) {
                const [agent, ip] = text.split('|');
                return { agent: this.agent.toJSON(agent), ip: ip.trim() };
            },
            toString() { return `${this.agent.toString()} | ${this.ip}`; }
        }

        next();
    }
}

declare global {
    namespace Express {
        interface Request {
            identifier: Identifier;
        }

        interface Identifier {
            agent: {
                browser: string;
                os: string;
                version: string;
                toJSON(text: string): Omit<Identifier['agent'], toJSONIgnore>;
                toString(): string;
            };
            clientIP: string;
            ip: string;
            toString(): string;
            toJSON(text: string): Omit<Identifier, toJSONIgnore>;
        }

        type toJSONIgnore = 'clientIP' | 'toJSON' | 'toString';
    }
}