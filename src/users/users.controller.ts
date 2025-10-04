import { Controller, Get, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { JwtGuard } from '../auth/guard/jwt.guard'; // Corrected the import path

// We use 'import type' because 'User' is only used as a type annotation.
// This is a TypeScript best practice for performance and type safety.
import type { User } from '@prisma/client';

@Controller('users')
export class UsersController {
  @UseGuards(JwtGuard)
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }
}