import isError from 'lodash/isError';
import isString from 'lodash/isString';
import swal from 'sweetalert';

export class ErrorHandler {

  handle(err: Error|{message: string, stack: string}|string) {
    let notificationMessage: string;
    if(isError(err)) {
      notificationMessage = err.message;
      console.error(err);
    } else if(isString(err)) {
      notificationMessage = err;
      console.error(err);
    } else {
      notificationMessage = err.message;
      console.error(`${err.message}\n${err.stack}`);
    }
    swal({
      title: 'Oops!',
      text: notificationMessage,
      icon: 'error',
    }).catch(console.error);
  }

}
