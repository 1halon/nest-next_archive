import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiService } from './api.service';

@Controller('api')
export class ApiController {
    constructor(private readonly apiService: ApiService) { }
}
