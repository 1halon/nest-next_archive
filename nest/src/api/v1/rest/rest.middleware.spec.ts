import { RestMiddleware } from './rest.middleware';

describe('RestMiddleware', () => {
  it('should be defined', () => {
    expect(new RestMiddleware()).toBeDefined();
  });
});
