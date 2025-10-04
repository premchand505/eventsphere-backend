import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { User } from '@prisma/client';

export const GetUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Use optional chaining: return user?.['property'] if user exists, otherwise undefined.
    return data ? user?.[data] : user;
  },
);