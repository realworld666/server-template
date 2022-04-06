import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Response,
  Route,
  SuccessResponse,
  Tags,
} from 'tsoa';
import ApiError from '../../api-error';

interface CrudObject {
  message: string;
}

@Route('crud')
@Tags('CRUD Controller')
export class CrudController extends Controller {
  /**
   * A GET request that returns a message
   * @returns the  word "hello"
   */
  @Get()
  public async getMessage(): Promise<CrudObject> {
    return {
      message: 'hello',
    };
  }

  /**
   * A POST method that takes  a string input
   * @param testParam a `CrudObject` type
   * @returns an echo of the input parameters
   */
  @Post()
  @SuccessResponse(201, 'Created')
  public async setMessage(@Body() testParam: CrudObject): Promise<CrudObject> {
    this.setStatus(201);
    return testParam;
  }

  /**
   * A sample  update method
   * @param changes the  data to change  in the database object
   * @returns an echo of the data passed in
   */
  @Patch('{idPathParam}')
  public async updateMessage(
    idPathParam: number,
    @Body() changes: CrudObject
  ): Promise<string> {
    return JSON.stringify(changes);
  }

  /**
   * This is a sample method that would delete an item from the database. It also demonstrates the HTTP response code  approach for error handling
   * @param id The id of the thing to  delete
   */
  @Delete('{idPathParam}')
  @Response<ApiError>(501, 'This method is not implemented')
  public async deleteMessage(idPathParam: number): Promise<void> {
    throw new ApiError('NotImplementedException', 501, `WIP ${idPathParam}`);
  }
}

export default CrudController;
