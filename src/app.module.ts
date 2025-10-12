import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { PaymentsModule } from './payments/payments.module';
import { ChatModule } from './chat/chat.module'; // 1. Import the new ChatModule
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    EventsModule,
    RegistrationsModule,
    PaymentsModule,
    ChatModule,
    StorageModule, // 2. Add ChatModule to the imports array
  ],
  controllers: [],
  // 3. IMPORTANT: Remove ChatGateway from here if it exists
  providers: [],
})
export class AppModule {}