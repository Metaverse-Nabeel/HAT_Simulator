import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { PdfTemplate } from "@/components/results/pdf-template";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ attemptId: string }> }
) {
    const { attemptId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const attempt = await prisma.examAttempt.findUnique({
        where: {
            id: attemptId,
            userId: session.user.id,
        },
    });

    if (!attempt || attempt.status !== "COMPLETED") {
        return NextResponse.json({ error: "Attempt not found or not completed" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true },
    });

    const buffer = await renderToBuffer(
        <PdfTemplate attempt={attempt} user={user} />
    );

    return new NextResponse(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="HAT_Report_${attemptId.slice(0, 8)}.pdf"`,
        },
    });
}
