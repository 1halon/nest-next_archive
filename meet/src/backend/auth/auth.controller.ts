import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from '../app.service';

@Controller({ host: 'localhost' })
export class AuthController {
  constructor(private readonly appService: AppService) {}

  @Get(['login', 'register'])
  login(@Res() res: Response) {
    this.appService.sendFile(res, 'auth.html');
  }
}
