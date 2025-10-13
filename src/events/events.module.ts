import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { RegistrationsModule } from 'src/registrations/registrations.module';
import { StorageModule } from 'src/storage/storage.module'; // 1. Import StorageModule

@Module({
  imports: [RegistrationsModule, StorageModule], // 2. Add StorageModule to imports
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}