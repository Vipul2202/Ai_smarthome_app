import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma';
import jwt from 'jsonwebtoken';
import { AuthErrors, ResourceErrors } from '../utils/errors';

export interface Context {
  prisma: typeof prisma;
  user?: {
    id: string;
    email: string;
  };
  request: FastifyRequest;
  reply: FastifyReply;
}

export async function createContext(request: FastifyRequest, reply: FastifyReply): Promise<Context> {
  let user;

  try {
    const authHeader = (request as any).headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this') as any;
      
      if (decoded && decoded.userId) {
        // Use cached user info from JWT payload if available (optimized)
        if (decoded.email && decoded.id) {
          user = {
            id: decoded.userId,
            email: decoded.email
          };
        } else {
          // Fallback to database lookup only if needed (minimal select)
          const dbUser = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true } // Only select needed fields
          });
          
          if (dbUser) {
            user = dbUser;
          }
        }
      }
    }
  } catch (error) {
    // Invalid token, continue without user (don't log in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('Invalid token:', error);
    }
  }

  return {
    prisma,
    user,
    request,
    reply,
  };
}

export function requireAuth(context: Context) {
  if (!context.user) {
    throw AuthErrors.unauthorized();
  }
  return context.user;
}

export async function requireHouseAccess(context: Context, houseId: string) {
  const user = requireAuth(context);
  
  const house = await context.prisma.house.findFirst({
    where: {
      id: houseId,
      userId: user.id,
    },
  });

  if (!house) {
    throw ResourceErrors.permissionDenied('house access');
  }

  return house;
}