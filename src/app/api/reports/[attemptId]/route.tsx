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

    // RE-HYDRATE EXPLANATIONS (Fix for Light Snapshot Optimization)
    // We fetch all explanations from the Question table using the IDs stored in resultsData
    const resultsData = (attempt.resultsData as any[]) || [];
    const questionIds = resultsData
        .filter(r => r.questionId && !r.questionId.startsWith('sample-'))
        .map(r => r.questionId);

    const dbExplanations = await prisma.question.findMany({
        where: { id: { in: questionIds } },
        select: { id: true, explanation: true }
    });

    // Create a lookup map for speed
    const expMap = new Map(dbExplanations.map(e => [e.id, e.explanation]));

    // Merge explanations back into resultsData for the PDF Template
    const hydratedResults = resultsData.map(r => ({
        ...r,
        explanation: r.explanation || expMap.get(r.questionId) || "Explanation not available."
    }));

    // Override resultsData for the template
    const hydratedAttempt = {
        ...attempt,
        resultsData: hydratedResults
    };

    const buffer = await renderToBuffer(
        <PdfTemplate attempt={hydratedAttempt} user={user} />
    );

    return new NextResponse(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="HAT_Report_${attemptId.slice(0, 8)}.pdf"`,
        },
    });
}
