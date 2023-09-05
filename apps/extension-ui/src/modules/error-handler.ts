import isError from 'lodash/isError';
import isString from 'lodash/isString';

export class ErrorHandler {

  handle(err: Error|{message: string, stack: string}|string) {
    if(isError(err) || isString(err)) {
      console.error(err);
    } else {
      console.error(`${err.message}\n${err.stack}`);
    }
  }

}
