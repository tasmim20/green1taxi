/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1]; // Extract token from header

    console.log('Authorization header:', request.headers['authorization']); // Log for debugging

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      console.log('Verifying token:', token); // Debug log

      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET, // Ensure you're using the correct secret
      });

      console.log('Decoded token:', decoded); // Log the decoded payload

      request.user = decoded; // Attach decoded data to the request object
      return true;
    } catch (error) {
      console.error('Token verification failed:', error); // Log errors

      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      }

      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
