import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function LeaderboardPage() {
    const topProfiles = await prisma.gamificationProfile.findMany({
        orderBy: {
            totalXP: "desc",
        },
        take: 50,
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
        <div className="container mx-auto py-10 px-4 md:px-8 space-y-8 max-w-4xl">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight">Global Leaderboard</h1>
                <p className="text-muted-foreground">Compete with other candidates and build your XP!</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Top 50 Candidates</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px] text-center">Rank</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead className="text-right">Total XP</TableHead>
                                    <TableHead className="text-right">Streak</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topProfiles.map((profile, i) => {
                                    const rank = i + 1;
                                    let rankMarkup = <span className="font-bold text-muted-foreground">#{rank}</span>;
                                    if (rank === 1) rankMarkup = <span className="font-bold text-yellow-500 text-xl">🥇 1st</span>;
                                    if (rank === 2) rankMarkup = <span className="font-bold text-gray-400 text-lg">🥈 2nd</span>;
                                    if (rank === 3) rankMarkup = <span className="font-bold text-amber-600 text-lg">🥉 3rd</span>;

                                    // Name default fallback
                                    const initials = (profile.user.name || profile.user.email || "?").charAt(0).toUpperCase();

                                    return (
                                        <TableRow key={profile.id} className={rank <= 3 ? "bg-muted/30" : ""}>
                                            <TableCell className="text-center">{rankMarkup}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={profile.user.image ?? ""} alt={profile.user.name ?? "User"} />
                                                        <AvatarFallback>{initials}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">
                                                        {profile.user.name || profile.user.email?.split("@")[0] || "Anonymous"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-amber-500">
                                                {profile.totalXP.toLocaleString()} XP
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-orange-500 flex justify-end items-center gap-1">
                                                {profile.currentStreak > 0 ? (
                                                    <>
                                                        {profile.currentStreak} 🔥
                                                    </>
                                                ) : (
                                                    <span className="text-muted-foreground font-normal">0</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        {topProfiles.length === 0 && (
                            <div className="p-8 text-center text-muted-foreground">
                                No exam data yet. Be the first to earn XP!
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
