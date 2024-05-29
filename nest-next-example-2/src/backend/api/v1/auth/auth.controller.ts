import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import assert from 'assert';
import { Response } from 'express';
import { GetMode } from 'src/shared/';
import UserService, { CreateDTO } from '../user/user.service';
import AuthService from './auth.service';

interface LoginDto {
  token: string;
  username: string;
}

@Controller({
  host: GetMode('src/backend/.env', process.env['NODE_ENV']).host,
  path: 'api/v1/auth',
})
export default class AuthController {
  constructor(
    public readonly auth_service: AuthService,
    public readonly user_service: UserService,
  ) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  create(@Res() res: Response, @Body() body: CreateDTO) {
    this.user_service
      .create(body)
      .then(console.log)
      .catch((error) => res.status(HttpStatus.BAD_REQUEST).send(error.message));
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  confirm() {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Res() res: Response, @Body() { token, username }: LoginDto) {
    try {
      assert(
        (typeof token === 'string' && token !== '') ||
          (typeof username === 'string' && username === ''),
        'Bad Request,' + HttpStatus.BAD_REQUEST,
      );
    } catch (error) {
      const [response, status] = error.message.split(',');
      res.status(Number(status)).send(response);
    }
  }
}
