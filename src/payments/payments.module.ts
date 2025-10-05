import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { RegistrationsModule } from 'src/registrations/registrations.module'; // 1. Import

@Module({
  imports: [RegistrationsModule], // 2. Add RegistrationsModule here
  providers: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}