import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenInfoService {
  async getTokenInfo() {
    return { data: 'Static Web3 token info' }; // Returning static data for now
  }
}
