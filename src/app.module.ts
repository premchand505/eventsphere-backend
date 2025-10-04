import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config'; // 1. Import ConfigModule
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ // 2. Add ConfigModule here
      isGlobal: true,      // Makes config available everywhere
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}