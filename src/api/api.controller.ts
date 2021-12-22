import { Controller } from '@nestjs/common';
import { ApiService } from './app.service';

@Controller('api')
export class ApiController {
    constructor(private readonly apiService: ApiService) { }
}
