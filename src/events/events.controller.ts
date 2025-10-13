import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseFloatPipe,
  ParseIntPipe, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors
} from '@nestjs/common';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { EventsService } from './events.service';
import { UpdateEventDto } from './dto/update-event.dto';
import { RegistrationsService } from 'src/registrations/registrations.service';
import { OptionalJwtGuard } from 'src/auth/guard/optional-jwt.guard';
import { User } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express'; // 1. Import FileInterceptor

@Controller('events')
export class EventsController {
  constructor(
    private eventsService: EventsService,
    private registrationsService: RegistrationsService,
  ) {}

  // 2. Update the createEvent endpoint
  @UseGuards(JwtGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image')) // Use the interceptor to handle a file named 'image'
  createEvent(
    @UploadedFile() imageFile: Express.Multer.File, // Get the uploaded file
    @Body() dto: CreateEventDto, // Get the rest of the form data
    @GetUser('id') userId: string,
  ) {
    // Because multipart/form-data sends all values as strings, we need to manually convert them
    dto.price = parseFloat(dto.price as any);
    dto.capacity = parseInt(dto.capacity as any, 10);
    
    return this.eventsService.createEvent(dto, userId, imageFile);
  }

  // ... (rest of the controller remains the same)
  @UseGuards(JwtGuard)
  @Get('host')
  getHostedEvents(@GetUser('id') userId: string) {
    return this.eventsService.getHostedEvents(userId);
  }

  @Get()
  getAllEvents(
    @Query('location') location?: string,
    @Query('name') name?: string,
    @Query('genre') genre?: string,
    // Add the limit query parameter
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.eventsService.getAllEvents({ location, name, genre, limit });
  }


  @UseGuards(OptionalJwtGuard)
  @Get(':id')
  getEventById(@Param('id') eventId: string, @GetUser() user: User | null) {
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
  deleteEvent(@Param('id') eventId: string, @GetUser('id') userId: string) {
    return this.eventsService.deleteEvent(userId, eventId);
  }

  @UseGuards(JwtGuard)
  @Post(':id/register')
  registerForEvent(@Param('id') eventId: string, @GetUser('id') userId: string) {
    return this.registrationsService.createRegistration(eventId, userId);
  }
}