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

// Attach a custom property to the Socket type
interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
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

  // 1. Authenticate the user when they connect
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
      // Attach userId to the socket object for later use
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

  // 2. Handle users joining a room
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: AuthenticatedSocket, eventId: string) {
    const userId = client.userId;
    
    // Check if user is registered for the event
    const registration = await this.prisma.registration.findFirst({
      where: { userId, eventId },
    });

    if (registration) {
      client.join(eventId);
      console.log(`User ${userId} joined room ${eventId}`);
    } else {
      console.log(`Unauthorized attempt by User ${userId} to join room ${eventId}`);
      // Optionally, emit an error back to the client
      client.emit('error', 'You are not registered for this event.');
    }
  }

  // 3. Handle users leaving a room
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

    // Optional: Fetch user's name to display in the chat
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true },
    });
    
    const userName = user?.firstName ?? user?.email;

    const messagePayload = {
      userId,
      userName,
      message,
      timestamp: new Date(),
    };

    // Broadcast the new message to everyone in the specific event room
    this.server.to(eventId).emit('newMessage', messagePayload);
  }
}