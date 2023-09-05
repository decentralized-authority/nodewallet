import { createContext } from 'react';
import { ErrorHandler } from '../modules/error-handler';

export const ErrorHandlerContext = createContext(new ErrorHandler());
