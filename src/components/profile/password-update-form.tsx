"use client";

import { useState } from "react";
import { Lock, Key as KeyIcon, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function PasswordUpdateForm() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match");
            setLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/user/update-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to update password");
            } else {
                setSuccess("Password updated successfully!");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-none shadow-sm bg-white overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 delay-150">
            <CardHeader className="border-b border-navy-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                        <Lock className="w-4 h-4" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-bold">Security</CardTitle>
                        <CardDescription className="text-xs">Update your account password</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-navy-400">Current Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-300" />
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-navy-50/50 border border-navy-100 focus:border-red-500 focus:ring-4 focus:ring-red-500/5 rounded-xl py-2.5 pl-12 pr-4 transition outline-none text-sm text-navy-900"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-navy-400">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-300" />
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-navy-50/50 border border-navy-100 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 rounded-xl py-2.5 pl-12 pr-4 transition outline-none text-sm text-navy-900"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-navy-400">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-300" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-navy-50/50 border border-navy-100 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 rounded-xl py-2.5 pl-12 pr-4 transition outline-none text-sm text-navy-900"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 animate-in fade-in zoom-in duration-300">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-xs font-bold">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 text-teal-600 bg-teal-50 p-3 rounded-xl border border-teal-100 animate-in fade-in zoom-in duration-300">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs font-bold">{success}</span>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto bg-navy-900 hover:bg-navy-800 text-white font-bold h-11 px-8 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Updating...</span>
                            </div>
                        ) : (
                            "Update Password"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
