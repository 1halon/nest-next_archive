import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Render,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Request, Response } from "express";
import { AppService } from "./app.service";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";

@Controller({ host: "localhost" })
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render("index")
  index(@Res() res: Response) {
    //this.appService.sendFile(res, 'index.html');
    return {};
  }

  @UseGuards(JwtAuthGuard)
  @Get("app*")
  app(@Res() res: Response) {
    this.appService.sendFile(res, "app.html");
  }
}
