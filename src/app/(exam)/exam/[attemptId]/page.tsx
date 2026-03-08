import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function ExamAttemptRootPage({
    params,
}: {
    params: Promise<{ attemptId: string }>;
}) {
    const { attemptId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/");
    }

    const attempt = await prisma.examAttempt.findUnique({
        where: {
            id: attemptId,
            userId: session.user.id,
        },
        select: {
            status: true,
            mode: true,
        },
    });

    if (!attempt) {
        redirect("/dashboard");
    }

    // If completed, always go to results
    if (attempt.status === "COMPLETED") {
        redirect(`/exam/${attemptId}/results`);
    }

    // Otherwise, route based on mode
    if (attempt.mode === "LEARNING") {
        redirect(`/exam/${attemptId}/learning`);
    } else {
        redirect(`/exam/${attemptId}/testing`);
    }
}
