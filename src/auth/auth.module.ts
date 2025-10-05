import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt'; // 1. Import JwtModule
import { JwtStrategy } from './strategy/jwt.strategy';
import { GoogleStrategy } from './strategy/google.strategy';
@Module({
  imports: [JwtModule.register({})], // 2. Add JwtModule to the imports
  controllers: [AuthController],
  providers: [AuthService,JwtStrategy,GoogleStrategy],
})
export class AuthModule {}