import {betterAuth} from 'better-auth';
import {prismaAdapter} from "better-auth/adapters/prisma";
import {prisma} from './prisma';

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    redirect: {
        signIn: "/dashboard",
        signUp: "/dashboard",
        signOut: "/"
    },
    emailVerification: {
        enabled: true,
        sendVerificationEmail: async ({ user, token }) => {
            const url = `http://localhost:3000/verify-email?token=${token}`;
            await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: user.email })
            });
        },
        autoSignInAfterVerification: true,
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
    },
    advanced: {
        generateId: false,
        crossSubDomainCookies: {
            enabled: false,
        }
    },
    plugins: [

    ],
    rateLimit: {
        enabled: true,
        maxRequests: 100,
        windowMs: 60,
        message: "Too many requests from this IP, please try again after an hour",
    }
});

export type Session = typeof auth.$Infer.Session;