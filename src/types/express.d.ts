// This file augments the global Express namespace
import { User } from '@prisma/client';

declare global {
  namespace Express {
    export interface Request {
      user?: User; // We are adding the 'user' property to the Request interface
    }
  }
}