import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { jwt } from '@elysiajs/jwt';
import { db } from '../lib/db';
import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { bcrypt } from 'bcryptjs';
import { t } from 'elysia';

const app = new Elysia()
  .use(cors())
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'super-secret-key-brilho-saas',
    })
  )
  .group('/api/auth', (app) =>
    app.post('/login', async ({ body, jwt, cookie: { set }, error }) => {
      const { email, password } = body;

      if (!email || !password) {
        return error(400, { success: false, error: { code: 'INVALID_INPUT', message: 'E-mail e senha são obrigatórios' } });
      }

      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return error(401, { success: false, error: { code: 'UNAUTHORIZED', message: 'E-mail ou senha incorretos' } });
      }

      const token = await jwt.sign({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      set.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      };
    })
  )
  .listen(3001);

console.log(`🚀 Backend running at ${app.server?.hostname}:${app.server?.port}`);
