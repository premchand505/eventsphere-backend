import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { AuthModule } from 'src/auth/auth.module';
import { EventsService } from './events.service';
import { RegistrationsModule } from 'src/registrations/registrations.module'; // 1. Import

@Module({
  imports: [AuthModule, RegistrationsModule], // 2. Add RegistrationsModule
  controllers: [EventsController],
  providers: [EventsService], // 3. EventsService remains here
})
export class EventsModule {}