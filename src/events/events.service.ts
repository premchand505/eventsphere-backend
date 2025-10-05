import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  createEvent(dto: CreateEventDto, userId: string) {
    return this.prisma.event.create({
      data: {
        ...dto,
        hostId: userId,
      },
    });
  }

  getAllEvents() {
    return this.prisma.event.findMany();
  }

  getEventById(eventId: string) {
    return this.prisma.event.findUniqueOrThrow({
      where: {
        id: eventId,
      },
 include: {
        host: {
          // Select only the fields we want to expose
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },

    });
  }

  async updateEvent(
    userId: string,
    eventId: string,
    dto: UpdateEventDto,
  ) {
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!event || event.hostId !== userId) {
      throw new ForbiddenException('Access to resources denied');
    }

    return this.prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        ...dto,
      },
    });
  }
   async deleteEvent(userId: string, eventId: string) {
    // 1. Find the event
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    // 2. Check if the event exists and if the user is the host
    // This is the same authorization check we used in updateEvent
    if (!event || event.hostId !== userId) {
      throw new ForbiddenException('Access to resources denied');
    }

    // 3. Delete the event
    await this.prisma.event.delete({
      where: {
        id: eventId,
      },
    });
  }


  
}