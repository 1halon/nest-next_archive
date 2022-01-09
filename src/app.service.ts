import { Injectable, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Injectable()
export class AppService {
    public views_dir = join(process.cwd(), 'client/public/views');

    sendFile(@Res() res: Response, path: string) {
        res.sendFile(join(this.views_dir, path));
    }
 }
