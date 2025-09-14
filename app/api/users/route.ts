import {NextRequest, NextResponse} from 'next/server';
import * as Sentry from '@sentry/nextjs';
import {auth, Session} from '@/lib/auth';
import {prisma} from '@/lib/prisma';

async function getCurrentUser(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        return session?.user as Session || null;
    } catch (error) {
        Sentry.captureException(error);
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const users = await prisma.user.findMany({
            where: {
                id: user.user.id,
            },
            orderBy: [
                { createdAt: 'desc' },
            ],
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}