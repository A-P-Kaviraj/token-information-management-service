import { Module } from '@nestjs/common';
import { TokenInfoController } from '../controllers/token-info.controller';
import { TokenInfoService } from '../services/token-info.service';
import { AccessGuard } from '../guards/access-guard.guard';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'access-key-queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [TokenInfoController],
  providers: [TokenInfoService, AccessGuard],
})
export class AppModule {}
