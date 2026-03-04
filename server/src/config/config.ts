import { registerAs } from '@nestjs/config';
import * as joi from 'joi';

export const validationSchema = joi.object({
  NODE_ENV: joi
    .string()
    .valid('development', 'staging', 'production')
    .default('development'),
  PORT: joi.number().default(3001),
  DATABASE_URL: joi.string().optional(),
  JWT_SECRET: joi.string().required().min(32),
  JWT_EXPIRATION: joi.string().default('1h'),
  BCRYPT_ROUNDS: joi.number().default(10),
  API_VERSION: joi.string().default('v1'),
  API_PREFIX: joi.string().default('api'),
  JWT_REFRESH_SECRET: joi.string().required().min(32),
  JWT_REFRESH_EXPIRATION: joi.string().default('3d'),
  CORS_ORIGIN: joi.string().default('*'),
  LOG_LEVEL: joi
    .string()
    .valid('debug', 'info', 'warn', 'error')
    .default('info'),
});

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  apiVersion: process.env.API_VERSION || 'v1',
  apiPrefix: process.env.API_PREFIX || 'api',
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['*'],
  logLevel: process.env.LOG_LEVEL,
}));

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  host: process.env.DATABASE_HOST,
  name: process.env.DATABASE_NAME,
}));

export const authConfig = registerAs('auth', () => ({
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRATION,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION,
}));
