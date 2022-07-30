import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import assert from 'assert';
import type { Response } from 'express';
import { GetMode } from 'src/shared/';
import UserService from '../user/user.service';
import AuthService from './auth.service';

@Controller({
  host: GetMode('src/backend/.env', process.env['NODE_ENV']).host,
  path: 'api/v1/auth',
})
export default class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Get('login')
  login() {
    
  }

  @Post('register')
  register(
    @Res() response: Response,
    @Body() body: { display_name?: string; username: string },
  ) {
    const { display_name, username } = body;

    this.userService
      .create({ display_name, username })
      .then(async function ([model, pass, hSet]) {
        const user = await model.save();
        hSet();
        response.status(HttpStatus.OK).send(pass);
      })
      .catch((error) =>
        response.status(HttpStatus.BAD_REQUEST).send(error.message),
      );
  }
}
