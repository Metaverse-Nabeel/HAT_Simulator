import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/");

  const firstName = session.user.name?.split(" ")[0] ?? "Student";

  return (
    <div className="max-w-6xl">
      {/* Welcome & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Welcome back, {firstName}!</h1>
          <p className="text-navy-500 text-sm mt-1">Ready for your next practice session?</p>
        </div>
        <Link
          href="/exam/setup"
          className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-xl text-sm font-semibold transition shadow-sm inline-flex items-center gap-2 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Start New Exam
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>}
          iconBg="bg-amber-50"
          label="Total XP"
          value="0"
          sub="Start earning XP"
        />
        <StatCard
          icon={<span className="text-orange-500 text-base">&#128293;</span>}
          iconBg="bg-orange-50"
          label="Current Streak"
          value="0 days"
          sub="Take a test today!"
        />
        <StatCard
          icon={<svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          iconBg="bg-blue-50"
          label="Exams Taken"
          value="0"
          sub="No exams yet"
        />
        <StatCard
          icon={<svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          iconBg="bg-green-50"
          label="Avg Score"
          value="--"
          sub="Complete an exam"
        />
      </div>

      {/* Performance & Section Breakdown */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-navy-100 shadow-sm">
          <h2 className="font-bold text-navy-900 mb-6">Score Trend</h2>
          <div className="h-48 flex items-center justify-center text-navy-400 text-sm">
            Complete exams to see your score trend
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-navy-100 shadow-sm">
          <h2 className="font-bold text-navy-900 mb-6">Section Strengths</h2>
          <div className="space-y-5">
            {[
              { label: "Verbal", pct: 0, color: "bg-teal-500" },
              { label: "Analytical", pct: 0, color: "bg-amber-400" },
              { label: "Quantitative", pct: 0, color: "bg-blue-500" },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-navy-700 font-medium">{s.label}</span>
                  <span className="text-navy-500">{s.pct}%</span>
                </div>
                <div className="w-full bg-navy-100 rounded-full h-2.5">
                  <div className={`${s.color} h-2.5 rounded-full`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Exams */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between border-b border-navy-100">
          <h2 className="font-bold text-navy-900">Recent Exams</h2>
          <Link href="/profile" className="text-teal-600 text-sm font-medium hover:underline">
            View all
          </Link>
        </div>
        <div className="px-6 py-12 text-center text-navy-400 text-sm">
          No exams taken yet. Start your first practice session!
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-navy-100 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-xs text-navy-500 font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-navy-900">{value}</p>
      <p className="text-xs text-navy-400 mt-1">{sub}</p>
    </div>
  );
}
