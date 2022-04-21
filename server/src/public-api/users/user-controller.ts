import { Body, Controller, Post, Route, Tags } from 'tsoa';
import { autoInjectable } from 'tsyringe';
import { RegisterData } from './models/register-data';
import UserService from './user-service';

/**
 * Controller for handing user creation
 */
@Route('users')
@Tags('User Controller')
@autoInjectable()
export class UserController extends Controller {
  constructor(private userService?: UserService) {
    super();
  }

  @Post()
  public async registerUser(@Body() postData: RegisterData): Promise<void> {
    await this.userService?.registerUser(postData.email);
    this.setStatus(204);
  }
}
