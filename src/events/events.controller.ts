// Add Patch to the imports here
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { EventsService } from './events.service';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @UseGuards(JwtGuard)
  @Post()
  createEvent(@Body() dto: CreateEventDto, @GetUser('id') userId: string) {
    return this.eventsService.createEvent(dto, userId);
  }

  @Get()
  getAllEvents() {
    return this.eventsService.getAllEvents();
  }

  @Get(':id')
  getEventById(@Param('id') eventId: string) {
    return this.eventsService.getEventById(eventId);
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
  @HttpCode(HttpStatus.NO_CONTENT) // Set status code to 204
  @Delete(':id')
  deleteEvent(
    @Param('id') eventId: string,
    @GetUser('id') userId: string,
  ) {
    return this.eventsService.deleteEvent(userId, eventId);
  }
}