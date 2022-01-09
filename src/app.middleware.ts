import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { join } from 'path';

@Injectable()
export class AppMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        next()
    }
}
