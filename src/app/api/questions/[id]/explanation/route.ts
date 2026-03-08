import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const question = await prisma.question.findUnique({
            where: { id },
            select: { explanation: true },
        });

        if (!question) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 });
        }

        return NextResponse.json({ explanation: question.explanation });
    } catch (error) {
        console.error("[FETCH_EXPLANATION_ERROR]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
