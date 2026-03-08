"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Globe, Mail, Lock, User as UserIcon, ArrowRight, Loader2 } from "lucide-react";
import { signUpAction } from "@/lib/actions/auth";

export function AuthCard() {
    const [mode, setMode] = useState<"SIGNIN" | "SIGNUP">("SIGNIN");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (mode === "SIGNUP") {
            const formData = new FormData();
            formData.append("email", email);
            formData.append("password", password);
            formData.append("name", name);

            const result = await signUpAction(formData);
            if (result.error) {
                setError(result.error);
                setLoading(false);
                return;
            }
            // Auto-signin after signup
            setMode("SIGNIN");
        }

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid credentials");
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-white rounded-3xl border border-navy-100 shadow-2xl overflow-hidden p-8 animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-navy-900">
                    {mode === "SIGNIN" ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="text-navy-500 text-sm mt-2">
                    {mode === "SIGNIN"
                        ? "Sign in to continue your HAT journey"
                        : "Join thousands of students preparing for HAT"}
                </p>
            </div>

            <button
                onClick={() => signIn("google", { redirectTo: "/dashboard" })}
                className="w-full flex items-center justify-center gap-3 bg-white border border-navy-200 hover:bg-navy-50 transition py-3 rounded-2xl text-navy-700 font-semibold mb-6 shadow-sm group"
            >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign in with Google
            </button>

            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-navy-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-navy-400 font-bold tracking-widest">Or continue with</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "SIGNUP" && (
                    <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-navy-50/50 border border-navy-100 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 rounded-2xl py-3 pl-12 pr-4 transition outline-none text-navy-900"
                            required
                        />
                    </div>
                )}
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-navy-50/50 border border-navy-100 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 rounded-2xl py-3 pl-12 pr-4 transition outline-none text-navy-900"
                        required
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-navy-50/50 border border-navy-100 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 rounded-2xl py-3 pl-12 pr-4 transition outline-none text-navy-900"
                        required
                    />
                </div>

                {error && (
                    <p className="text-red-500 text-xs font-medium pl-1">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 group shadow-lg shadow-navy-900/10 active:scale-[0.98]"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            {mode === "SIGNIN" ? "Sign In" : "Create Account"}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <div className="text-center mt-8">
                <button
                    onClick={() => setMode(mode === "SIGNIN" ? "SIGNUP" : "SIGNIN")}
                    className="text-navy-500 text-sm hover:text-navy-900 transition font-medium"
                >
                    {mode === "SIGNIN"
                        ? "Don't have an account? Create one"
                        : "Already have an account? Sign in"}
                </button>
            </div>
        </div>
    );
}
