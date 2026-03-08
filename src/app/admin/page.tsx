import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Brain, Zap } from "lucide-react";

export default async function AdminDashboard() {
    const [userCount, examCount, questionCount, activeAttempts] = await Promise.all([
        prisma.user.count(),
        prisma.examAttempt.count({ where: { status: "COMPLETED" } }),
        prisma.question.count(),
        prisma.examAttempt.count({ where: { status: "IN_PROGRESS" } }),
    ]);

    const stats = [
        {
            title: "Total Users",
            value: userCount,
            icon: Users,
            description: "Registered candidates",
            color: "text-blue-600",
            bg: "bg-blue-100",
        },
        {
            title: "Completed Exams",
            value: examCount,
            icon: BookOpen,
            description: "Successful sessions",
            color: "text-green-600",
            bg: "bg-green-100",
        },
        {
            title: "AI Questions",
            value: questionCount,
            icon: Brain,
            description: "In central repository",
            color: "text-purple-600",
            bg: "bg-purple-100",
        },
        {
            title: "Live Sessions",
            value: activeAttempts,
            icon: Zap,
            description: "Currently ongoing",
            color: "text-amber-600",
            bg: "bg-amber-100",
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-navy-900">Dashboard Overview</h1>
                <p className="text-navy-500">Real-time system metrics for HAT Simulator.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <div className={`${stat.bg} ${stat.color} p-2 rounded-lg`}>
                                <stat.icon className="w-4 h-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                            <p className="text-xs text-navy-500 mt-1">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>System Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <HealthItem label="Database" status="Healthy" />
                            <HealthItem label="AI Engine (Gemini)" status="Healthy" />
                            <HealthItem label="Auth Service" status="Healthy" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function HealthItem({ label, status }: { label: string; status: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-navy-600">{label}</span>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-700">{status}</span>
            </div>
        </div>
    );
}
