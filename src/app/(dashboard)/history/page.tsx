import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPST } from "@/lib/utils/date";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ChevronRight, History as HistoryIcon, Target, Award } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function HistoryPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/");
    }

    // Fetch all exam attempts for the user
    const attempts = await prisma.examAttempt.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
    });

    const stats = {
        total: attempts.length,
        completed: attempts.filter(a => a.status === "COMPLETED").length,
        avgScore: attempts.length > 0
            ? Math.round(attempts.reduce((acc, a) => acc + (a.score || 0), 0) / attempts.length)
            : 0
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-navy-900 flex items-center gap-2">
                        <HistoryIcon className="w-8 h-8 text-teal-600" />
                        Exam History
                    </h1>
                    <p className="text-navy-500 mt-1">Review your journey and track your progress over time.</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                            <Target className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-navy-500 font-medium">Total Attempts</p>
                            <p className="text-2xl font-bold text-navy-900">{stats.total}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-navy-500 font-medium">Completed</p>
                            <p className="text-2xl font-bold text-navy-900">{stats.completed}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-navy-500 font-medium">Average Score</p>
                            <p className="text-2xl font-bold text-navy-900">{stats.avgScore}%</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm overflow-hidden bg-white">
                <CardHeader className="bg-white border-b border-navy-50 px-6 py-5">
                    <CardTitle className="text-lg">All Previous Attempts</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {attempts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-navy-50/50">
                                    <TableRow>
                                        <TableHead className="px-6">Category</TableHead>
                                        <TableHead>Level</TableHead>
                                        <TableHead>Difficulty</TableHead>
                                        <TableHead>Mode</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right px-6">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attempts.map((attempt) => (
                                        <TableRow key={attempt.id} className="hover:bg-navy-50/30 transition-colors">
                                            <TableCell className="px-6 font-medium">
                                                <Badge variant="outline" className="border-navy-200">
                                                    {attempt.category.replace("HAT_", "HAT-")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-navy-100 text-navy-700">
                                                    {attempt.level}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={
                                                    attempt.difficulty === "SUPER_HARD" ? "bg-red-500" :
                                                        attempt.difficulty === "HARD" ? "bg-orange-500" :
                                                            attempt.difficulty === "MEDIUM" ? "bg-blue-500" : "bg-green-500"
                                                }>
                                                    {attempt.difficulty}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={attempt.mode === "TESTING" ? "default" : "secondary"}>
                                                    {attempt.mode}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className={`font-bold ${attempt.score && attempt.score >= 50 ? 'text-teal-600' : 'text-navy-900'}`}>
                                                        {attempt.score !== null ? `${attempt.score}%` : 'N/A'}
                                                    </span>
                                                    {attempt.status === "IN_PROGRESS" && (
                                                        <span className="text-[10px] text-amber-600 font-bold uppercase tracking-tighter">In Progress</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-navy-500 text-sm">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatPST(new Date(attempt.createdAt), "MMM d, yyyy")}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right px-6">
                                                <Link href={attempt.status === "COMPLETED" ? `/exam/${attempt.id}/results` : `/exam/${attempt.id}`}>
                                                    <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 group">
                                                        {attempt.status === "COMPLETED" ? "View Results" : "Resume"}
                                                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="p-20 text-center">
                            <div className="w-20 h-20 bg-navy-50 text-navy-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                <HistoryIcon className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-navy-900">No History Yet</h3>
                            <p className="text-navy-400 mt-2 max-w-sm mx-auto">
                                You haven't taken any exams yet. Start your first session to see your progress here.
                            </p>
                            <Link href="/exam" className="mt-8 inline-block">
                                <Button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 rounded-xl shadow-lg transition-all hover:scale-105">
                                    Start Practice Session
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
