import { Controller, Get, Render } from '@nestjs/common';
import { GetMode } from 'src/shared/';
import { AppService } from './app.service';

@Controller({
  host: GetMode('src/backend/.env', process.env['NODE_ENV']).host,
})
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  index() {
    return {};
  }

  @Get(['login', 'register'])
  @Render('auth')
  auth() {
    return {};
  }
}
