import { prisma } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SECTION_LABELS } from "@/lib/constants/exam";

export default async function QuestionsAdminPage() {
    const questions = await prisma.question.findMany({
        orderBy: { createdAt: "desc" },
        take: 50, // recent 50
    });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-navy-900">Questions Repository</h1>
                <p className="text-navy-500">Review AI-generated questions stored in the database.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Questions ({questions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Section</TableHead>
                                    <TableHead>Level</TableHead>
                                    <TableHead>Difficulty</TableHead>
                                    <TableHead className="w-[400px]">Question Content</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {questions.map((q) => (
                                    <TableRow key={q.id}>
                                        <TableCell>
                                            <Badge variant="outline">{q.category.replace("HAT_", "")}</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm font-medium">
                                            {SECTION_LABELS[q.section]}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{q.level}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={
                                                q.difficulty === "SUPER_HARD" ? "bg-red-600" :
                                                    q.difficulty === "HARD" ? "bg-orange-500" :
                                                        q.difficulty === "MEDIUM" ? "bg-blue-500" : "bg-green-500"
                                            }>
                                                {q.difficulty}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm text-navy-800 line-clamp-2">{q.questionText}</p>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {questions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-navy-400">
                                            No questions have been generated yet. Take an exam to trigger AI generation.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
