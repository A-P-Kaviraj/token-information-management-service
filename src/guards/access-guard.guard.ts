import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { CanActivate, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ThrottlerService } from '../throttler/throttler.service';

@Injectable()
export class AccessGuard implements CanActivate {
  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly client: ClientProxy,
    private readonly throttlerService: ThrottlerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessKey = request.headers['x-access-key'];

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

      if (!result.valid) {
        throw new UnauthorizedException('Invalid access key');
      }

      // Check against throttling
      const allowed = this.throttlerService.isAllowed(
        accessKey,
        result.rateLimit,
        result.ttl,
      );
      if (!allowed) {
        throw new UnauthorizedException('Rate limit exceeded');
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException('Error validating access key');
    }
  }
}
