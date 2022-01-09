import { Body, Controller, Get, HttpCode, Post, Render, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }
  
  @Get()
  index(@Res() res: Response) {
    this.appService.sendFile(res, "index.html");
  }
}
