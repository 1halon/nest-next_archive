import { Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/v1')
export class AuthController {
    constructor() {}

    @Get()
    index() {
        
    }

    @Post()
    signin() {
        
    }

    @Post()
    signup() {

    }
}
