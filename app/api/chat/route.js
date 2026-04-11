import { createPostHandler } from '@/lib/chat/postHandler.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = createPostHandler();
