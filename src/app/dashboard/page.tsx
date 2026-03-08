import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/");
    }

    // Fetch user profile and history
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            gamificationProfile: true,
            examAttempts: {
                orderBy: { createdAt: "desc" },
                take: 10, // top 10 recent exams
            },
        },
    });

    if (!user) {
        redirect("/");
    }

    const profile = user.gamificationProfile;
    const exams = user.examAttempts;

    return (
        <div className="container mx-auto py-10 px-4 md:px-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {user.name}!</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total XP</CardTitle>
                        <span className="text-amber-500 font-bold text-xl">⭐</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{profile?.totalXP ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Lifetime experience points</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                        <span className="text-orange-500 font-bold text-xl">🔥</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{profile?.currentStreak ?? 0} days</div>
                        <p className="text-xs text-muted-foreground">Keep it up for multipliers!</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
                        <span className="text-blue-500 font-bold text-xl">🎖️</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{profile?.longestStreak ?? 0} days</div>
                        <p className="text-xs text-muted-foreground">Your personal best</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
                        <span className="text-green-500 font-bold text-xl">📝</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{exams.length} completed</div>
                        <p className="text-xs text-muted-foreground">In your recent history</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Exam History</CardTitle>
                </CardHeader>
                <CardContent>
                    {exams.length === 0 ? (
                        <p className="text-muted-foreground">No recent exams found. Start a practice test to earn XP!</p>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Mode</TableHead>
                                        <TableHead>Difficulty</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead className="text-right">XP Earned</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {exams.map((exam) => (
                                        <TableRow key={exam.id}>
                                            <TableCell className="font-medium">
                                                {format(new Date(exam.createdAt), "MMM d, yyyy h:mm a")}
                                            </TableCell>
                                            <TableCell>{exam.category.replace("HAT_", "HAT ")}</TableCell>
                                            <TableCell>
                                                <Badge variant={exam.mode === "TESTING" ? "default" : "secondary"}>
                                                    {exam.mode}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {exam.difficulty}
                                            </TableCell>
                                            <TableCell>
                                                {exam.score !== null ? `${exam.score}/${exam.maxScore}` : "N/A"}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-amber-500">
                                                {exam.xpEarned ? `+${exam.xpEarned}` : "-"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
