import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { TokenPayload, AuthTokens } from '../types';

export class JWTUtil {
  static generateAccessToken(payload: Omit<TokenPayload, 'tokenType'>): string {
    return jwt.sign(
      { ...payload, tokenType: 'access' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN as any }
    );
  }

  static generateRefreshToken(payload: Omit<TokenPayload, 'tokenType'>): string {
    return jwt.sign(
      { ...payload, tokenType: 'refresh' },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any }
    );
  }

  static generateTokenPair(payload: Omit<TokenPayload, 'tokenType'>): AuthTokens {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
  }

  static verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
  }

  static decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  static isTokenExpired(token: string): boolean {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return true;
    return expiration < new Date();
  }
}
