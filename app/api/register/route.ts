import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';
import {z} from 'zod';
import bcrypt from 'bcrypt';

const registerSchema = z.object({
    email: z.email(),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = registerSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { email, name, password } = parsed.data;

        // Check if user already exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                name,
                passwordHash,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            select: { id: true, email: true, name: true },
        });

        return NextResponse.json({ message: 'User registered', user }, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
