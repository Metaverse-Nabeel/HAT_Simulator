import { prisma } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

export default async function UsersAdminPage() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { examAttempts: true },
            },
        },
    });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-navy-900">User Management</h1>
                <p className="text-navy-500">View and manage all registered candidates.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users ({users.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead>Exams</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => {
                                    const initials = (user.name || user.email || "?").charAt(0).toUpperCase();
                                    return (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={user.image ?? ""} />
                                                        <AvatarFallback>{initials}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-navy-900">{user.name || "Anonymous"}</span>
                                                        <span className="text-xs text-navy-500">{user.email}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-navy-600">
                                                {format(new Date(user.createdAt), "MMM d, yyyy")}
                                            </TableCell>
                                            <TableCell className="text-sm text-navy-600 font-medium">
                                                {user._count.examAttempts}
                                            </TableCell>
                                            <TableCell>
                                                {user.banned ? (
                                                    <Badge variant="destructive">Banned</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Active</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
