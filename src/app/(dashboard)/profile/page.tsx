import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
// Triggering redeploy with examAttempts fix
import { User, Mail, Calendar, Shield, Trophy, Activity, History, ArrowRight, Lock, Key as KeyIcon, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordUpdateForm } from "@/components/profile/password-update-form";

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            gamificationProfile: true,
            examAttempts: {
                orderBy: { createdAt: "desc" },
                take: 3,
            }
        }
    });

    if (!user) redirect("/");

    const xpProgress = ((user.gamificationProfile?.totalXP || 0) % 1000) / 10;
    const level = Math.floor((user.gamificationProfile?.totalXP || 0) / 1000) + 1;

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Left Sidebar: User Identity */}
                <div className="w-full md:w-1/3 space-y-6">
                    <Card className="border-none shadow-xl shadow-navy-900/5 bg-white overflow-hidden hover:shadow-2xl transition-all duration-500">
                        <div className="h-32 bg-gradient-to-br from-navy-900 to-navy-800 relative">
                            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                                <div className="w-24 h-24 rounded-3xl bg-white p-1.5 shadow-xl transition-transform hover:scale-110 duration-500">
                                    <div className="w-full h-full rounded-2xl bg-teal-500 flex items-center justify-center text-white text-3xl font-black shadow-inner">
                                        {user.name?.[0].toUpperCase()}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <CardContent className="pt-16 pb-8 text-center">
                            <h2 className="text-2xl font-bold text-navy-900">{user.name}</h2>
                            <p className="text-navy-500 text-sm mt-1">{user.email}</p>

                            <div className="mt-6 flex flex-wrap justify-center gap-2">
                                <Badge className="bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200 transition-colors">
                                    {user.role}
                                </Badge>
                                <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200 transition-colors">
                                    Lvl {level}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow duration-300">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy-400">Account Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 text-sm group">
                                <Mail className="w-4 h-4 text-navy-200 group-hover:text-teal-500 transition-colors" />
                                <span className="text-navy-700 font-medium">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm group">
                                <Calendar className="w-4 h-4 text-navy-200 group-hover:text-teal-500 transition-colors" />
                                <span className="text-navy-700 font-medium">Joined {format(new Date(user.createdAt), "MMMM yyyy")}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm group">
                                <Shield className="w-4 h-4 text-navy-200 group-hover:text-teal-500 transition-colors" />
                                <span className="text-navy-700 font-medium">{user.role === 'ADMIN' ? 'Full Access' : 'Standard Student'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Password Update Section */}
                    <PasswordUpdateForm />
                </div>

                {/* Right Content: Stats & Activity */}
                <div className="w-full md:w-2/3 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card className="border-none shadow-sm bg-navy-900 text-white overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                            <CardContent className="p-6 relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <Trophy className="w-8 h-8 text-amber-400 animate-bounce-slow" />
                                    <span className="text-navy-400 text-[10px] font-bold uppercase tracking-[0.2em] leading-none">Total XP</span>
                                </div>
                                <div className="text-4xl font-black mb-1">{user.gamificationProfile?.totalXP || 0}</div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-navy-400">
                                        <span>Progress to Lvl {level + 1}</span>
                                        <span>{Math.round(xpProgress)}%</span>
                                    </div>
                                    <Progress value={xpProgress} className="h-1.5 bg-white/10" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-teal-600 text-white overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                            <CardContent className="p-6 relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <Activity className="w-8 h-8 text-white animate-pulse" />
                                    <span className="text-teal-100 text-[10px] font-bold uppercase tracking-[0.2em] leading-none">Daily Streak</span>
                                </div>
                                <div className="text-4xl font-black mb-1">{user.gamificationProfile?.currentStreak || 0}</div>
                                <p className="text-teal-100 text-[10px] font-bold uppercase tracking-wider">Consecutive study days</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <CardHeader className="border-b border-navy-50 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold">Recent Achievements</CardTitle>
                                <p className="text-navy-400 text-xs mt-0.5">Your latest milestones on the platform</p>
                            </div>
                            <History className="w-5 h-5 text-navy-200" />
                        </CardHeader>
                        <CardContent className="p-6">
                            {user.examAttempts.length > 0 ? (
                                <div className="space-y-4">
                                    {user.examAttempts.map((attempt) => (
                                        <div key={attempt.id} className="flex items-center justify-between p-4 rounded-2xl bg-navy-50/50 border border-navy-100/50 hover:bg-white hover:shadow-xl hover:shadow-navy-900/5 hover:-translate-y-1 transition-all duration-300 group cursor-default">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-navy-100 flex items-center justify-center font-bold text-navy-900 shadow-sm group-hover:border-teal-500 transition-colors">
                                                    {attempt.score || 0}%
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-navy-900 group-hover:text-teal-600 transition-colors">{attempt.category.replace("_", "-")}</p>
                                                    <p className="text-[10px] text-navy-400 font-bold uppercase tracking-wider">{attempt.mode}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-xs text-navy-500 font-medium">{format(new Date(attempt.createdAt), "MMM d, yyyy")}</p>
                                                    <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest">Completed</p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-navy-200 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-navy-400">
                                    <div className="w-16 h-16 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Activity className="w-6 h-6 text-navy-200" />
                                    </div>
                                    <p className="text-sm font-medium">No activity recorded yet.</p>
                                    <Link href="/exam">
                                        <Button variant="link" className="text-teal-600 font-bold hover:scale-105 transition-transform cursor-pointer">
                                            Start your first exam
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
