import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiService } from './app.service';

@Controller('api')
export class ApiController {
    constructor(private readonly apiService: ApiService) { }
}
