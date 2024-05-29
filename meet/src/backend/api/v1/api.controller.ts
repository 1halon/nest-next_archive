import { Controller } from '@nestjs/common';

@Controller({ host: 'localhost', path: 'api/v1' })
export class ApiControllerV1 {
  constructor() {}
}
