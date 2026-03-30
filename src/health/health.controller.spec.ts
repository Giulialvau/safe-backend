import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('should return ok status', () => {
    const controller = new HealthController();
    const response = controller.getHealth();

    expect(response.status).toBe('ok');
    expect(response.timestamp).toBeDefined();
  });
});
