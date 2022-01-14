import { Injectable, Res } from '@nestjs/common';
import { compile } from 'ejs';
import { Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class AppService {
    public readonly views_dir = join(process.cwd(), 'client/public/views');
    public readonly templates_dir = join(process.cwd(), 'client/private/templates');

    compileTemplate(path: string) {
        return compile(readFileSync(join(this.templates_dir, path)).toString());
    }
    sendFile(@Res() res: Response, path: string) {
        res.sendFile(join(this.views_dir, path));
    }
}
