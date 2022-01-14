import { MailerService } from '@nestjs-modules/mailer';
import { Body, Controller, Get, HttpCode, HttpException, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { join } from 'path';
import { AppService } from 'src/app.service';
import { AuthService } from 'src/auth/auth.service';
import { ApiService } from './api.service';
import * as ejs from "ejs";
import { readFileSync } from 'fs';
import { UserService } from 'src/user/user.service';

@Controller('api')
export class ApiController {
    constructor(
        private readonly appService: AppService,
        private readonly apiService: ApiService,
        private readonly authService: AuthService,
        private readonly mailerService: MailerService,
        private readonly userService: UserService
    ) { }
    private readonly pass_template = this.appService.compileTemplate('mail/password.ejs');

    @Post('/create')
    async create(@Body('email') email: string) {
        
    }
}
