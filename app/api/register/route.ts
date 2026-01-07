import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';

const registerSchema = z.object({
	email: z.email(),
	name: z.string().min(2, 'Navn må være minst to tegn'),
	password: z.string().min(8, 'Passordet må ha minst 8 tegn'),
});

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const parsed = registerSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json({ error: 'Validering feilet', details: parsed.error.message }, { status: 400 });
		}

		const { email, name, password } = parsed.data;

		// Check if user already exists
		const existing = await prisma.user.findUnique({ where: { email } });
		if (existing) {
			return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
		}

		// Hash password

		// Create user
		const user = await prisma.user.create({
			data: {
				email,
				name,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			select: { id: true, email: true, name: true },
		});

		return NextResponse.json({ message: 'User registered', user }, { status: 201 });
	} catch (err) {
		Sentry.captureException(err, {
			tags: { endpoint: 'register', method: 'POST' },
			extra: { message: 'Error registering user' },
		});
		console.error(err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
