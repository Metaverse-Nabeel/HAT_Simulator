import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Medal, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function LeaderboardPage() {
    const session = await auth();

    // Fetch top 50 users by XP
    const topUsers = await prisma.gamificationProfile.findMany({
        take: 50,
        orderBy: { totalXP: "desc" },
        include: {
            user: {
                select: {
                    name: true,
                    image: true,
                    email: true,
                },
            },
        },
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-bold text-navy-900">Global Leaderboard</h1>
                <p className="text-navy-500 mt-1">Celebrating the top HAT candidates worldwide.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top 3 Spotlight */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {topUsers.slice(0, 3).map((profile, index) => (
                        <Card key={profile.id} className={`border-none shadow-md ${index === 0 ? "bg-amber-50" : index === 1 ? "bg-slate-50" : "bg-orange-50"}`}>
                            <CardContent className="pt-6 pb-6 text-center">
                                <div className="relative inline-block mb-4">
                                    <Avatar className="h-20 w-20 border-4 border-white shadow-sm mx-auto">
                                        <AvatarImage src={profile.user.image || ""} />
                                        <AvatarFallback className="text-2xl font-bold bg-navy-100 text-navy-600">
                                            {profile.user.name?.[0] || profile.user.email?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg ${index === 0 ? "bg-amber-500" : index === 1 ? "bg-slate-400" : "bg-orange-400"}`}>
                                        <Trophy className="w-4 h-4" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-navy-900 truncate max-w-full">{profile.user.name || "Anonymous User"}</h3>
                                <p className="text-2xl font-black text-navy-900 mt-1">{profile.totalXP.toLocaleString()} XP</p>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    <Badge variant="secondary" className="bg-white/50 border-none">
                                        Rank #{index + 1}
                                    </Badge>
                                    {profile.currentStreak > 0 && (
                                        <Badge variant="outline" className="border-orange-200 text-orange-600 bg-orange-50/50">
                                            <Flame className="w-3 h-3 mr-1" /> {profile.currentStreak}d Streak
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Global Rankings Table */}
                <Card className="lg:col-span-3 border-none shadow-sm overflow-hidden">
                    <CardHeader className="bg-white border-b border-navy-50 px-6 py-5">
                        <CardTitle className="text-lg">Candidate Rankings</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-navy-50/50">
                                <TableRow>
                                    <TableHead className="w-20 px-6 text-center">Rank</TableHead>
                                    <TableHead>Candidate</TableHead>
                                    <TableHead>Experience Points</TableHead>
                                    <TableHead>Daily Streak</TableHead>
                                    <TableHead className="text-right px-6">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topUsers.map((profile, index) => {
                                    const isCurrentUser = session?.user?.email === profile.user.email;
                                    return (
                                        <TableRow key={profile.id} className={`transition-colors ${isCurrentUser ? "bg-teal-50/50" : "hover:bg-navy-50/30"}`}>
                                            <TableCell className="px-6 text-center font-bold text-navy-400">
                                                {index === 0 ? <span className="text-amber-500 text-xl">🥇</span> :
                                                    index === 1 ? <span className="text-slate-400 text-xl">🥈</span> :
                                                        index === 2 ? <span className="text-orange-400 text-xl">🥉</span> :
                                                            index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3 py-1">
                                                    <Avatar className="h-9 w-9 border border-navy-50">
                                                        <AvatarImage src={profile.user.image || ""} />
                                                        <AvatarFallback>{profile.user.name?.[0] || profile.user.email?.[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className={`font-bold text-sm ${isCurrentUser ? "text-teal-700" : "text-navy-900"}`}>
                                                            {profile.user.name || "Anonymous"} {isCurrentUser && <span className="text-[10px] font-medium bg-teal-100 px-1.5 py-0.5 rounded ml-1">YOU</span>}
                                                        </span>
                                                        <span className="text-[11px] text-navy-400 font-medium">HAT Master Apprentice</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-navy-900">{profile.totalXP.toLocaleString()}</span>
                                                    <span className="text-[10px] text-navy-400 uppercase tracking-tighter font-bold">Total XP</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-orange-600 font-bold">
                                                    <Flame className="w-4 h-4 mr-1.5" />
                                                    {profile.currentStreak} days
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right px-6">
                                                <Badge variant="outline" className="text-[10px] border-navy-200 text-navy-500 bg-navy-50 px-2 py-0">
                                                    PRO CANDIDATE
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
