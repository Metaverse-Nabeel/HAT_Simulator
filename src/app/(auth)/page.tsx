import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CredentialsLogin } from "@/components/auth/credentials-login";

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ admin?: string }>;
}) {
  const { admin } = await searchParams;
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="font-sans bg-white text-navy-900 antialiased">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-navy-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="font-bold text-xl text-navy-900">HAT Simulator</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-navy-600">
            <a href="#features" className="hover:text-navy-900 transition">Features</a>
            <a href="#categories" className="hover:text-navy-900 transition">Categories</a>
            <a href="#how-it-works" className="hover:text-navy-900 transition">How It Works</a>
          </div>
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="bg-navy-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-navy-800 transition flex items-center gap-2"
            >
              <GoogleIcon className="w-4 h-4" />
              Sign in with Google
            </button>
          </form>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-hero pt-32 pb-20 md:pt-40 md:pb-32 relative overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-400/20 rounded-full px-4 py-1.5 mb-6 mx-auto lg:mx-0">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                <span className="text-teal-200 text-sm font-medium">AI-Powered Practice Platform</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
                Master the HEC HAT Exam<br />
                <span className="text-teal-300">with Confidence</span>
              </h1>
              <p className="text-lg md:text-xl text-navy-300 mb-10 max-w-2xl leading-relaxed">
                Practice with AI-generated questions tailored to your category and difficulty level. Track your progress, compete on leaderboards, and ace your exam.
              </p>
              {!admin && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <form
                    action={async () => {
                      "use server";
                      await signIn("google", { redirectTo: "/dashboard" });
                    }}
                  >
                    <button
                      type="submit"
                      className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-xl text-base font-semibold transition shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2"
                    >
                      <GoogleIcon className="w-5 h-5" />
                      Get Started Free
                    </button>
                  </form>
                  <Link
                    href="#categories"
                    className="glass-card text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-white/10 transition text-center"
                  >
                    View Categories
                  </Link>
                </div>
              )}
            </div>

            {admin && (
              <div className="w-full max-w-sm shrink-0">
                <CredentialsLogin />
                <Link
                  href="/"
                  className="mt-4 text-xs text-navy-300 hover:text-white transition block w-full text-center"
                >
                  Back to Google Login
                </Link>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg">
            <div>
              <div className="text-3xl font-bold text-white">5</div>
              <div className="text-navy-400 text-sm mt-1">HAT Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">100+</div>
              <div className="text-navy-400 text-sm mt-1">Questions/Exam</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-teal-300">AI</div>
              <div className="text-navy-400 text-sm mt-1">Generated</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 bg-navy-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-teal-600 font-semibold text-sm uppercase tracking-wider mb-3">Why HAT Simulator</p>
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900">Everything you need to prepare</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
              iconBg="bg-teal-50"
              title="AI-Powered Questions"
              description="Unlimited practice with dynamically generated questions calibrated to official HEC HAT standards and difficulty levels."
            />
            <FeatureCard
              icon={<svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
              iconBg="bg-amber-50"
              title="XP & Streaks"
              description="Earn experience points, maintain daily streaks, and climb the global leaderboard. Stay motivated through gamification."
            />
            <FeatureCard
              icon={<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
              iconBg="bg-blue-50"
              title="Two Study Modes"
              description="Testing Mode simulates the real exam. Learning Mode gives instant feedback with detailed explanations for every question."
            />
            <FeatureCard
              icon={<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
              iconBg="bg-purple-50"
              title="Detailed Reports"
              description="Download PDF reports with section-wise breakdowns, time analysis, and individual question reviews after every test."
            />
            <FeatureCard
              icon={<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>}
              iconBg="bg-green-50"
              title="Customizable Tests"
              description="Adjust time limits, question counts, and difficulty levels. Practice specific sections like Verbal, Analytical, or Quantitative."
            />
            <FeatureCard
              icon={<svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
              iconBg="bg-red-50"
              title="All 5 HAT Categories"
              description="Full coverage for HAT-I (Engineering), HAT-II (Management), HAT-III (Arts), HAT-IV (Medical), and HAT-General."
            />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-teal-600 font-semibold text-sm uppercase tracking-wider mb-3">HAT Categories</p>
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900">Choose your stream</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CategoryCard tag="HAT-I" title="Engineering & Technology" subtitle="CS, Mathematics, Statistics, Physics" verbal={30} analytical={30} quantitative={40} />
            <CategoryCard tag="HAT-II" title="Management Sciences" subtitle="Business Education" verbal={30} analytical={40} quantitative={30} />
            <CategoryCard tag="HAT-III" title="Arts & Humanities" subtitle="Social Sciences, Psychology, Law" verbal={40} analytical={35} quantitative={25} />
            <CategoryCard tag="HAT-IV" title="Biological & Medical" subtitle="Agriculture, Veterinary, Physical Sciences" verbal={40} analytical={30} quantitative={30} />
            <CategoryCard tag="General" tagColor="bg-navy-800" title="HAT-General" subtitle="Religious Studies" verbal={40} analytical={30} quantitative={30} />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28 bg-navy-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-teal-600 font-semibold text-sm uppercase tracking-wider mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900">Start practicing in 3 steps</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: "1", title: "Sign Up", desc: "One-click Google sign-in. No forms, no hassle. Start practicing instantly." },
              { step: "2", title: "Configure Your Exam", desc: "Pick your category, level, difficulty, and mode. Customize time and question count." },
              { step: "3", title: "Practice & Improve", desc: "Take tests, earn XP, track your progress, and climb the leaderboard." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/20">
                  <span className="text-white text-2xl font-bold">{item.step}</span>
                </div>
                <h3 className="font-bold text-navy-900 mb-2">{item.title}</h3>
                <p className="text-navy-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-hero py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-teal-500/5" />
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to ace your HAT exam?</h2>
          <p className="text-navy-300 text-lg mb-10">Join thousands of students preparing smarter with AI-powered practice tests.</p>
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="bg-teal-500 hover:bg-teal-600 text-white px-10 py-4 rounded-xl text-base font-semibold transition shadow-lg shadow-teal-500/25 inline-flex items-center gap-2"
            >
              <GoogleIcon className="w-5 h-5" />
              Start Practicing Now
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-900 text-navy-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="font-bold text-lg text-white">HAT Simulator</span>
            </div>
            <div className="flex flex-col items-center md:items-end gap-1">
              <p className="text-sm">Prepare for Pakistan&apos;s HEC HAT exam with AI-powered practice.</p>
              <div className="flex items-center gap-4">
                <p className="text-sm">&copy; 2026 HAT Simulator. All rights reserved.</p>
                <Link href="/?admin=true" className="text-xs text-navy-500 hover:text-navy-300 transition">Admin Login</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#fff" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" />
    </svg>
  );
}

function FeatureCard({
  icon,
  iconBg,
  title,
  description,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-navy-100 hover:shadow-md transition">
      <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center mb-5`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-navy-900 mb-2">{title}</h3>
      <p className="text-navy-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function CategoryCard({
  tag,
  tagColor = "bg-teal-500",
  title,
  subtitle,
  verbal,
  analytical,
  quantitative,
}: {
  tag: string;
  tagColor?: string;
  title: string;
  subtitle: string;
  verbal: number;
  analytical: number;
  quantitative: number;
}) {
  const highlight = (section: string, value: number) => {
    const max = Math.max(verbal, analytical, quantitative);
    const isMax = value === max;
    return isMax
      ? "bg-teal-50 text-teal-700 font-medium"
      : "bg-navy-50 text-navy-600";
  };

  return (
    <div className="border border-navy-200 rounded-2xl p-6 hover:border-teal-400 hover:shadow-lg transition group">
      <div className="flex items-center gap-3 mb-4">
        <span className={`${tagColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>{tag}</span>
        <span className="text-xs text-navy-500">MS & PhD</span>
      </div>
      <h3 className="font-bold text-navy-900 mb-2">{title}</h3>
      <p className="text-sm text-navy-500 mb-4">{subtitle}</p>
      <div className="flex gap-2 text-xs">
        <span className={`px-2 py-1 rounded ${highlight("verbal", verbal)}`}>Verbal {verbal}%</span>
        <span className={`px-2 py-1 rounded ${highlight("analytical", analytical)}`}>Analytical {analytical}%</span>
        <span className={`px-2 py-1 rounded ${highlight("quantitative", quantitative)}`}>Quant {quantitative}%</span>
      </div>
    </div>
  );
}
