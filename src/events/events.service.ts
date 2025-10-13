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

  // NEW METHOD: Get events hosted by a specific user
  getHostedEvents(userId: string) {
    return this.prisma.event.findMany({
      where: {
        hostId: userId,
      },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async getEventById(eventId: string, userId?: string) {
    const event = await this.prisma.event.findUniqueOrThrow({
      where: { id: eventId },
      include: {
        host: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    let isRegistered = false;
    if (userId) {
      const registration = await this.prisma.registration.findFirst({
        where: {
          eventId: eventId,
          userId: userId,
        },
      });
      if (registration) {
        isRegistered = true;
      }
    }
    return { ...event, isRegistered };
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
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!event || event.hostId !== userId) {
      throw new ForbiddenException('Access to resources denied');
    }
    
    // Also delete associated registrations before deleting the event
    await this.prisma.registration.deleteMany({
      where: {
        eventId: eventId,
      },
    });

    await this.prisma.event.delete({
      where: {
        id: eventId,
      },
    });
  }
}