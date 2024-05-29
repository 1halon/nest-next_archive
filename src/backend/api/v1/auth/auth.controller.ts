import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { GetMode } from 'src/shared/';
import UserService from '../user/user.service';
import type { CreationDTO } from '../user/user.service';
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

  @Post('login')
  login() {}

  @Post('register')
  register(@Res() response: Response, @Body() body: CreationDTO) {
    this.userService
      .create(body)
      .then(([user, pass, hSet]) => {
        response.send(pass);
      })
      .catch(response.status(HttpStatus.BAD_REQUEST).send.bind(response));
  }
}
