import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'; // 1. Add ForbiddenException here
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegistrationsService } from 'src/registrations/registrations.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private registrationsService: RegistrationsService,
  ) {
    this.stripe = new Stripe(this.config.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2025-09-30.clover',
    });
  }

  async createCheckoutSession(eventId: string, userId: string) {
    // ... (This method remains unchanged)
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: event.title,
              description: event.description,
            },
            unit_amount: Math.round(event.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/events/${eventId}`,
      metadata: {
        eventId,
        userId,
      },
    });

    return { url: session.url };
  }

  async handleWebhookEvent(signature: string, body: Buffer) {
    // ... (This method remains unchanged, but now ForbiddenException is correctly imported)
    const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET')!;
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      throw new ForbiddenException('Invalid webhook signature');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, eventId } = session.metadata!;
      
      await this.registrationsService.createRegistration(eventId, userId);
    }

    return { received: true };
  }
}