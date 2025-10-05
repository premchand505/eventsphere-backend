import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  // Import JwtModule so its services (like JwtService) are available here
  imports: [JwtModule.register({}), AuthModule],
  // List ChatGateway as the provider for this module
  providers: [ChatGateway],
})
export class ChatModule {}