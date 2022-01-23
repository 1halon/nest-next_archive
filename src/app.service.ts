import { Injectable, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Injectable()
export class AppService {
    private readonly assets_dir = join(process.cwd(), 'client', 'public');

    sendFile(@Res() res: Response, path: string) {
        res.sendFile(join(this.assets_dir, path));
    }
}
