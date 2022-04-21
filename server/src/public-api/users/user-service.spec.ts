import 'reflect-metadata';
import { container } from 'tsyringe';
import UserService from './user-service';

describe('User Service', () => {
  it('create a new user', async () => {
    // the single test
    const userService = container.resolve(UserService);

    await userService.registerUser('test@test.com');
  });
});
