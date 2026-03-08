import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // @ts-ignore
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { password: true }
        });

        if (!user || !user.password) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // @ts-ignore
        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Password update error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
