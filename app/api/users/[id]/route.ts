import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Params {
    params: { id: string }
}

/**
 * Get user with given ID
 * @param request 
 * @param params 
 * @returns user
 */
export async function GET(request: Request, { params }: Params) {
    const { id } = params;

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: id,
            },
        });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);

    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * Delete user with given ID
 * @param request 
 * @param params 
 * @returns status code
 */
export async function DELETE(request: Request, { params }: Params) {
    const { id } = params

    try {
        const deleteUser = await prisma.user.delete({
            where: {
                id: id,
            },
        })

        if (!deleteUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ status: 204 })

    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

