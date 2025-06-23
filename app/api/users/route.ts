import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


/**
 * Get all user
 * @returns all users
 */
export async function GET() {
    const users = await prisma.user.findMany()

    return NextResponse.json(users)
};

/**
 * Create new user
 * @param request
 * @returns user
 */

export async function POST(request:Request) {
    const user = await prisma.user.create({
        data: {
            request.data
        },
    })
}