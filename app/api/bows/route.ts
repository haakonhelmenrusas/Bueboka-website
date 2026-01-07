import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

async function getCurrentUser() {
	try {
		const reqHeaders = await headers();
		const headerObj: Record<string, string> = {};
		for (const [key, value] of reqHeaders) {
			headerObj[key] = value;
		}
		const session = await auth.api.getSession({ headers: headerObj });
		return session?.user || null;
	} catch (error) {
		return null;
	}
}

export async function POST(request: NextRequest) {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { name, type } = await request.json();

		if (!name || !type) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		const bow = await prisma.bow.create({
			data: {
				userId: user.id,
				name,
				type,
			},
		});

		return NextResponse.json({ bow }, { status: 201 });
	} catch (error) {
		console.error('Error creating bow:', error);
		return NextResponse.json({ error: 'Failed to create bow' }, { status: 500 });
	}
}

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const bows = await prisma.bow.findMany({
			where: { userId: user.id },
		});

		return NextResponse.json({ bows });
	} catch (error) {
		console.error('Error fetching bows:', error);
		return NextResponse.json({ error: 'Failed to fetch bows' }, { status: 500 });
	}
}
