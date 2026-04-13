import { Elysia } from 'elysia';

export const app = new Elysia({ prefix: '/api' })
  .get('/ping', () => 'pong');

export type App = typeof app;
