import { Injectable } from '@nestjs/common';
import type { NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class AppMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction) {
    if (request.useragent)
      request.identifier = {
        agent: {
          browser: request.useragent.browser,
          os: request.useragent.os,
          version: request.useragent.version,
          toJSON(text: string) {
            const [bv, os] = text.split('-'),
              [browser, version] = bv.split('/');
            return { browser, os: os.trim(), version: version.trim() };
          },
          toString() {
            return `${this.browser}/${this.version} - ${this.os}`;
          },
        },
        clientIP: request.clientIp,
        ip: request.ip,
        toJSON(text: string) {
          const [agent, ip] = text.split('|');
          return { agent: this.agent.toJSON(agent), ip: ip.trim() };
        },
        toString() {
          return `${this.agent.toString()} | ${this.ip}`;
        },
      };
    else return next('INVALID_IDENTIFIER');

    next();
  }
}

declare global {
  namespace Express {
    type toJSONIgnore = 'clientIP' | 'validate' | 'toJSON' | 'toString';

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
      validate?(): boolean;
      toString(): string;
      toJSON(text: string): Omit<Identifier, toJSONIgnore>;
    }

    interface Request {
      identifier?: Identifier;
    }
  }
}
