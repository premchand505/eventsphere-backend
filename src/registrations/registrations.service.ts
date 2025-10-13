import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RegistrationsService {
  constructor(private prisma: PrismaService) {}

  // NEW METHOD to get all registrations for a user
  getRegistrationsByUser(userId: string) {
    return this.prisma.registration.findMany({
      where: {
        userId: userId,
      },
      include: {
        event: { // Include the full event details for each registration
          select: {
            id: true,
            title: true,
            location: true,
            date: true,
            featuring: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createRegistration(eventId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: eventId },
      });
      if (!event) {
        throw new NotFoundException('Event not found');
      }

      if (event.hostId === userId) {
        throw new ForbiddenException('You cannot register for your own event.');
      }

      const existingRegistration = await tx.registration.findFirst({
        where: { eventId, userId },
      });
      if (existingRegistration) {
        throw new ConflictException('You are already registered for this event.');
      }

      const registrationCount = await tx.registration.count({
        where: { eventId },
      });
      if (registrationCount >= event.capacity) {
        throw new ForbiddenException('This event has reached full capacity.');
      }

      const registration = await tx.registration.create({
        data: {
          eventId,
          userId,
        },
      });

      return registration;
    });
  }
}