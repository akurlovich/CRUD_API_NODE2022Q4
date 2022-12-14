export class ErrorsController extends Error {
  public message: string;
  public name = 'ErrorsController';

  constructor(message: string) {
    super();
    this.message = message || 'Something went wrong';
  }
};
