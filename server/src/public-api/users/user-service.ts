import { inject, injectable } from 'tsyringe';
import ApiError from '../../api-error';
import IamService from '../../services/iam-service';
import AppConfigService from '../../services/common/config/app-config-service';

/**
 * User logic
 */
@injectable()
class UserService {
  constructor(@inject('IamService') private iam: IamService, private configService: AppConfigService) {}

  /**
   * Create a new user if it doesnt already exist
   * @param email the email address of the user to create
   */
  public async registerUser(email: string): Promise<void> {
    const normalisedEmail = this.normaliseEmail(email);
    if (!this.configService.isValidEmail(normalisedEmail)) {
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
    const config = this.configService.getConfig();
    return config?.caseSensitiveEmail === true ? email : email.toLocaleLowerCase();
  }
}

export default UserService;
