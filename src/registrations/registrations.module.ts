import { Module } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { RegistrationsController } from './registrations.controller'; // 1. Import the controller

@Module({
  controllers: [RegistrationsController], // 2. Add the controller here
  providers: [RegistrationsService],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}