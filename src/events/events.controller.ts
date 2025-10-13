import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { EventsService } from './events.service';
import { UpdateEventDto } from './dto/update-event.dto';
import { RegistrationsService } from 'src/registrations/registrations.service';
import { OptionalJwtGuard } from 'src/auth/guard/optional-jwt.guard';
import { User } from '@prisma/client';

@Controller('events')
export class EventsController {
  constructor(
    private eventsService: EventsService,
    private registrationsService: RegistrationsService,
  ) {}

  @UseGuards(JwtGuard)
  @Post()
  createEvent(@Body() dto: CreateEventDto, @GetUser('id') userId: string) {
    return this.eventsService.createEvent(dto, userId);
  }

  // NEW ENDPOINT for fetching hosted events
  @UseGuards(JwtGuard)
  @Get('host')
  getHostedEvents(@GetUser('id') userId: string) {
    return this.eventsService.getHostedEvents(userId);
  }

  @Get()
  getAllEvents() {
    return this.eventsService.getAllEvents();
  }

  @UseGuards(OptionalJwtGuard)
  @Get(':id')
  getEventById(
    @Param('id') eventId: string,
    @GetUser() user: User | null,
  ) {
    return this.eventsService.getEventById(eventId, user?.id);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  updateEvent(
    @Param('id') eventId: string,
    @Body() dto: UpdateEventDto,
    @GetUser('id') userId: string,
  ) {
    return this.eventsService.updateEvent(userId, eventId, dto);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteEvent(
    @Param('id') eventId: string,
    @GetUser('id') userId: string,
  ) {
    return this.eventsService.deleteEvent(userId, eventId);
  }

  @UseGuards(JwtGuard)
  @Post(':id/register')
  registerForEvent(
    @Param('id') eventId: string,
    @GetUser('id') userId: string,
  ) {
    return this.registrationsService.createRegistration(eventId, userId);
  }
}