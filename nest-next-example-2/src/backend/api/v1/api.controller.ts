import { Controller } from '@nestjs/common';
import { GetMode } from 'src/shared';

@Controller({
  host: GetMode('src/backend/.env', process.env['NODE_ENV']).host,
  path: 'api/v1',
})
export default class ApiController {}
