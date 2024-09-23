import { Injectable } from '@nestjs/common';

interface ThrottleEntry {
  count: number;
  expiresAt: number;
  ttl: number;
}

@Injectable()
export class ThrottlerService {
  private throttleMap = new Map<string, ThrottleEntry>();

  // Add a key with its TTL
  addKey(key: string, rateLimit: number, ttl: number): void {
    console.log(`Rate limit: ${rateLimit}, TTL: ${ttl}`);
    console.log(`Adding key: ${key}`);
    const now = Date.now();
    this.throttleMap.set(key, {
      count: 0,
      expiresAt: now + ttl * 1000,
      ttl, // Store TTL for future use
    });
  }

  // Reset key to initial state with its original TTL
  resetKey(key: string, ttl: number): void {
    console.log(`Resetting key: ${key}`);
    const now = Date.now();
    this.throttleMap.set(key, {
      count: 1, // Reset count to 1
      expiresAt: now + ttl * 1000, // Reset expiresAt based on original TTL
      ttl, // Keep original TTL
    });
  }

  // Check if the request is allowed under the current rate limits
  isAllowed(key: string, limit: number, ttl: number): boolean {
    const entry = this.throttleMap.get(key);
    const now = Date.now();

    if (!entry) {
      // Key not found, treat as new
      console.log(`Adding new key: ${key}`);
      this.addKey(key, limit, ttl); // Use the provided TTL
      return true;
    }

    if (now > entry.expiresAt) {
      // Reset if expired using resetKey method
      console.log(`Key expired: ${key}`);
      this.resetKey(key, entry.ttl); // Reset with the stored TTL
      return true;
    }

    if (entry.count < limit) {
      console.log(`Incrementing count for key: ${key}`);
      // Increment count
      entry.count++;
      return true;
    }

    console.log(`Rate limit exceeded for key: ${key}`);
    return false; // Rate limit exceeded
  }
}
