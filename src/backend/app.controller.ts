import { Controller, Get, Render, Req, Res } from '@nestjs/common';
import { Request } from 'express';
import { RenderableResponse } from 'nest-next';
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
  auth(@Res() response: RenderableResponse, @Req() request: Request) {
    response.render(request.url.slice(1), {});
  }
}
