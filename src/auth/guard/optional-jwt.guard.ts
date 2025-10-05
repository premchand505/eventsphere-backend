import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
  // Override the handleRequest method
  handleRequest(err, user, info) {
    // This will return the user if the token is valid, or null if not.
    // It will not throw an error for unauthenticated requests.
    return user;
  }
}