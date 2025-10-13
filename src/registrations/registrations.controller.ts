import { Controller, Get, UseGuards } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/auth/decorator/get-user.decorator';

@Controller('registrations')
export class RegistrationsController {
  constructor(private registrationsService: RegistrationsService) {}

  @UseGuards(JwtGuard)
  @Get('me')
  getMyRegistrations(@GetUser('id') userId: string) {
    return this.registrationsService.getRegistrationsByUser(userId);
  }
}