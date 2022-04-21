import { inject, injectable } from 'tsyringe';
import { Config, isValidEmail } from '../../app-config';
import ApiError from '../../api-error';
import IamService from '../../services/iam-service';

/**
 * User logic
 */
@injectable()
class UserService {
  constructor(@inject('IamService') private iam: IamService, @inject('Config') private config: Config) {}

  /**
   * Create a new user if it doesnt already exist
   * @param email the email address of the user to create
   */
  public async registerUser(email: string): Promise<void> {
    const normalisedEmail = this.normaliseEmail(email);
    if (!isValidEmail(normalisedEmail)) {
      throw new ApiError('INVALID_EMAIL', 400, 'Email address is invalid');
    }

    try {
      await this.iam.createUser(email);
    } catch (error: any) {
      // if this throws an exception about the user already existing then ignore it as thats valid
      if (error.code !== 'UsernameExistsException') {
        throw error;
      }
    }
  }

  private normaliseEmail(email: string) {
    return this.config?.caseSensitiveEmail === true ? email : email.toLocaleLowerCase();
  }
}

export default UserService;
