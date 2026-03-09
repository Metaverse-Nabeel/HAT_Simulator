import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Flame, Target, BookOpen, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import { formatPST } from "@/lib/utils/date";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  // Fetch Gamification Stats
  const profile = await prisma.gamificationProfile.findUnique({
    where: { userId: session.user.id },
  });

  // Fetch Recent Exam Attempts
  const recentExams = await prisma.examAttempt.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const stats = [
    {
      title: "Total XP",
      value: profile?.totalXP || 0,
      icon: Trophy,
      color: "text-amber-500",
      bg: "bg-amber-50",
      desc: "Rank: #--"
    },
    {
      title: "Current Streak",
      value: `${profile?.currentStreak || 0} Days`,
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-50",
      desc: "Keep it up!"
    },
    {
      title: "Category Focus",
      value: "HAT-I",
      icon: Target,
      color: "text-teal-500",
      bg: "bg-teal-50",
      desc: "Top Section: Verbal"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Hello, {session.user.name?.split(" ")[0]}!</h1>
          <p className="text-navy-500 mt-1 text-lg">Your HAT preparation journey is evolving.</p>
        </div>
        <Link href="/exam/setup">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95">
            <BookOpen className="w-5 h-5 mr-2" />
            Start Practice Session
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-navy-500 uppercase tracking-wider">{stat.title}</CardTitle>
              <div className={`${stat.bg} ${stat.color} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-navy-900">{stat.value}</div>
              <p className="text-xs text-navy-400 mt-1 font-medium">{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Exams Section */}
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-white border-b border-navy-50 px-6 py-5">
            <div>
              <CardTitle className="text-lg">Recent Exam History</CardTitle>
              <p className="text-xs text-navy-400 mt-1">Review your latest performance trends.</p>
            </div>
            <Link href="/history" className="text-teal-600 text-sm font-semibold hover:text-teal-700 flex items-center">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentExams.length > 0 ? (
              <Table>
                <TableHeader className="bg-navy-50/50">
                  <TableRow>
                    <TableHead className="px-6">Category</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right px-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentExams.map((exam) => (
                    <TableRow key={exam.id} className="hover:bg-navy-50/30 transition-colors">
                      <TableCell className="px-6 font-medium">
                        <Badge variant="outline" className="border-navy-200">
                          {exam.category.replace("HAT_", "HAT-")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-teal-600">{exam.score || 0}%</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={exam.mode === "TESTING" ? "default" : "secondary"}>
                          {exam.mode}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-navy-500 text-sm">
                        {formatPST(new Date(exam.createdAt))}
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <Link href={`/exam/${exam.id}/results`}>
                          <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                            Details
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-navy-50 text-navy-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-navy-900 font-semibold">No Exams Yet</h3>
                <p className="text-navy-400 text-sm mt-1 max-w-[250px] mx-auto">
                  Take your first practice exam to start tracking your performance.
                </p>
                <Link href="/exam/setup" className="mt-4 inline-block">
                  <Button variant="outline" className="border-teal-200 text-teal-600 hover:bg-teal-50">
                    Go to Exam Setup
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Level & Mastery Sidebar Card */}
        <Card className="border-none shadow-sm overflow-hidden bg-navy-900 text-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center font-bold">
              <Trophy className="w-5 h-5 mr-2 text-amber-400" />
              Mastery Level
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="text-3xl font-bold">Lvl 1</span>
                  <p className="text-navy-300 text-xs mt-1 uppercase tracking-widest font-bold">Apprentice</p>
                </div>
                <span className="text-navy-300 text-xs">{profile?.totalXP || 0} / 1000 XP</span>
              </div>
              <Progress value={((profile?.totalXP || 0) % 1000) / 10} className="h-2 bg-white/10" />
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <h4 className="text-xs font-semibold uppercase text-navy-300 tracking-wider">Top Skills</h4>
              <SkillBar label="Verbal Reasoning" value={0} color="bg-teal-400" />
              <SkillBar label="Analytical Skills" value={0} color="bg-amber-400" />
              <SkillBar label="Quantitative Ability" value={0} color="bg-blue-400" />
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
              <p className="text-sm font-medium">Tip of the Day</p>
              <p className="text-xs text-navy-300 mt-1 leading-relaxed">
                Consistency is key! Completing just 10 questions a day maintains your streak and sharpens your intuition.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SkillBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-white font-medium">{label}</span>
        <span className="text-navy-300">{value}%</span>
      </div>
      <Progress value={value} className={`h-1.5 bg-white/5 ${color}`} />
    </div>
  );
}
