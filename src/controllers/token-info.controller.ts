import { Controller, Get, UseGuards } from '@nestjs/common';
import { AccessGuard } from '../guards/access-guard.guard';
import { TokenInfoService } from '../services/token-info.service';

@Controller('token-info')
@UseGuards(AccessGuard)
export class TokenInfoController {
  constructor(private readonly appService: TokenInfoService) {}

  @Get()
  async getTokenInfo() {
    return this.appService.getTokenInfo();
  }
}
