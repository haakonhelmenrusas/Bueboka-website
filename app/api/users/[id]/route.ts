import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

interface ParamsContext {
	params: Promise<{ id: string }>;
}

/**
 * Get user with given ID
 * @param request
 * @param context
 * @returns user
 */
export async function GET(request: NextRequest, context: ParamsContext) {
	const { id } = await context.params;

	try {
		const user = await prisma.user.findUnique({
			where: { id },
		});

		if (!user) {
			return NextResponse.json({ message: 'User not found' }, { status: 404 });
		}

		return NextResponse.json(user);
	} catch (error) {
		return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
	}
}

/**
 * Delete user with given ID
 * @param request
 * @param context
 * @returns status code
 */
export async function DELETE(request: NextRequest, context: ParamsContext) {
	const { id } = await context.params;

	try {
		const deleteUser = await prisma.user.delete({
			where: { id },
		});

		if (!deleteUser) {
			return NextResponse.json({ message: 'User not found' }, { status: 404 });
		}

		return NextResponse.json({ status: 204 });
	} catch (error) {
		return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
	}
}
