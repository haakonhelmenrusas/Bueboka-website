import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

// Export all HTTP methods that better-auth might use
const handler = toNextJsHandler(auth);

export const GET = handler.GET;
export const POST = handler.POST;
export const PUT = handler.PUT;
export const PATCH = handler.PATCH;
export const DELETE = handler.DELETE;
