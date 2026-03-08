"use server";

import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";
import { z } from "zod";

const signupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function signUpAction(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const validated = signupSchema.safeParse({ name, email, password });

    if (!validated.success) {
        return { error: validated.error.issues[0].message };
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { error: "User already exists with this email" };
        }

        const hashedPassword = await hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "USER",
                gamificationProfile: {
                    create: {},
                },
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Signup error:", error);
        return { error: "Something went wrong. Please try again." };
    }
}
