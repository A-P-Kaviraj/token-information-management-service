import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { CanActivate, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AccessGuard implements CanActivate {
  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly client: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessKey = request.headers['x-access-key'];

    console.log('Access key:', accessKey);

    if (!accessKey) {
      throw new UnauthorizedException('Access key is missing');
    }

    try {
      const keyValidation = this.client.send<{
        valid: boolean;
        rateLimit: number;
        ttl: number;
      }>('access_key_check', { key: accessKey });
      const result = await firstValueFrom(keyValidation);
      console.log('Access key validation result:', result);

      if (!result.valid) {
        throw new UnauthorizedException('Invalid access key');
      }

      // I am not sure about the below code, tried it for dynamic throttling
      const limit = result.rateLimit;
      const ttl = result.ttl;

      // Using NestJS's built-in throttling mechanism
      request['throttler'] = { limit, ttl };

      return true;
    } catch (error) {
      console.error('Error validating access key:', error);
      throw new UnauthorizedException('Error validating access key');
    }
  }
}
