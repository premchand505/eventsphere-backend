import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: (origin, callback) => {
      const productionUrl = process.env.FRONTEND_URL;
      const allowed = [
        'http://localhost:3001',
        productionUrl,
      ];
      if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    const token = client.handshake.auth.token;
    if (!token) {
      client.disconnect();
      return;
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get('JWT_SECRET'),
      });
      client.userId = payload.sub;
      console.log(`✅ Client Connected: ${client.id}, User ID: ${client.userId}`);
    } catch (e) {
      console.log('Authentication error:', e.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    console.log(`❌ Client Disconnected: ${client.id}, User ID: ${client.userId}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: AuthenticatedSocket, eventId: string) {
    const userId = client.userId;

    // 1. Fetch the event to check who the host is
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
        client.emit('error', 'Event not found.');
        return;
    }

    // 2. Check if user is the host
    const isHost = event.hostId === userId;

    // 3. Check if user is registered (if they aren't the host)
    const registration = !isHost ? await this.prisma.registration.findFirst({
      where: { userId, eventId },
    }) : null;

    // 4. Authorize if user is the host OR is registered
    if (isHost || registration) {
      client.join(eventId);
      console.log(`User ${userId} joined room ${eventId}`);
    } else {
      console.log(`Unauthorized attempt by User ${userId} to join room ${eventId}`);
      client.emit('error', 'You are not authorized to join this chat.');
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: AuthenticatedSocket, eventId: string): void {
    client.leave(eventId);
    console.log(`User ${client.userId} left room ${eventId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    client: AuthenticatedSocket,
    payload: { eventId: string; message: string },
  ) {
    const userId = client.userId!;
    const { eventId, message } = payload;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    });
    
    // Use firstName + lastName for the display name
    const userName = (user?.firstName && user?.lastName) 
      ? `${user.firstName} ${user.lastName}` 
      : 'Anonymous';

    const messagePayload = {
      userId,
      userName,
      message,
      timestamp: new Date(),
    };

    this.server.to(eventId).emit('newMessage', messagePayload);
  }
}