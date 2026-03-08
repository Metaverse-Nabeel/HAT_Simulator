"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ZapOff, ShieldAlert, Clock } from "lucide-react";

interface ErrorDisplayProps {
    error: string | null;
    className?: string;
}

export function ErrorDisplay({ error, className }: ErrorDisplayProps) {
    if (!error) return null;

    // Map technical errors to user-friendly ones
    const getErrorInfo = (err: string) => {
        const e = err.toLowerCase();

        if (e.includes("limit reached") || e.includes("daily limit")) {
            return {
                title: "Daily Limit Reached",
                description: "You've hit your daily goal of 10 exams. Great work! Come back tomorrow for more practice or check your history to review past attempts.",
                variant: "info" as const,
                icon: ShieldAlert,
            };
        }

        if (e.includes("quota") || e.includes("exhausted") || e.includes("rate limit")) {
            return {
                title: "AI is busy taking a break",
                description: "Our high-speed AI engine is receiving a lot of requests. We've switched to a stable fallback, but if errors persist, please wait 60 seconds and try again.",
                variant: "warning" as const,
                icon: ZapOff,
            };
        }

        if (e.includes("unauthorized") || e.includes("sign in")) {
            return {
                title: "Session Expired",
                description: "Please sign in again to continue your practice session.",
                variant: "destructive" as const,
                icon: AlertCircle,
            };
        }

        return {
            title: "Something went wrong",
            description: err || "An unexpected error occurred. Please refresh the page or try again in a moment.",
            variant: "destructive" as const,
            icon: AlertCircle,
        };
    };

    const info = getErrorInfo(error);
    const Icon = info.icon;

    return (
        <Alert variant={info.variant} className={className}>
            <Icon className="h-4 w-4" />
            <AlertTitle className="font-bold">{info.title}</AlertTitle>
            <AlertDescription>
                {info.description}
            </AlertDescription>
        </Alert>
    );
}
