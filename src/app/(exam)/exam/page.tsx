"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Brain, Hourglass, Trophy, Activity, Target } from "lucide-react";
import { ErrorDisplay } from "@/components/exam/ErrorDisplay";

export default function ExamSetupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [category, setCategory] = useState("HAT_I");
    const [level, setLevel] = useState("MS");
    const [mode, setMode] = useState("TESTING");
    const [difficulty, setDifficulty] = useState("RANDOM");
    const [questionCount, setQuestionCount] = useState([100]); // slider
    const [timeLimit, setTimeLimit] = useState([120]); // slider in minutes

    const handleStart = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/exam/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category,
                    level,
                    mode,
                    difficulty,
                    questionCount: questionCount[0],
                    timeLimit: timeLimit[0] * 60, // convert minutes to seconds
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create exam");
            }

            router.push(`/exam/${data.attemptId}`);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 md:px-8 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="shadow-lg border-t-4 border-t-teal-500 hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Brain className="w-6 h-6" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Exam Configuration</CardTitle>
                            <CardDescription>Customize your HAT practice session parameters.</CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-8 mt-4 cursor-default">
                    <ErrorDisplay error={error} />

                    {/* Grid for Primary Selects */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-sm font-semibold flex items-center gap-2 cursor-pointer">
                                <Target className="w-4 h-4 text-navy-500" />
                                Category
                            </label>
                            <Select value={category} onValueChange={(val) => val && setCategory(val)}>
                                <SelectTrigger className="w-full h-11 bg-white border-navy-200 hover:border-teal-500 transition-colors cursor-pointer">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent alignItemWithTrigger={false} sideOffset={8} className="w-[var(--anchor-width)] min-w-[300px]">
                                    <SelectItem value="HAT_I" className="cursor-pointer">HAT-I (Engineering/CS)</SelectItem>
                                    <SelectItem value="HAT_II" className="cursor-pointer">HAT-II (Management)</SelectItem>
                                    <SelectItem value="HAT_III" className="cursor-pointer">HAT-III (Arts/Social)</SelectItem>
                                    <SelectItem value="HAT_IV" className="cursor-pointer">HAT-IV (Medical/Bio)</SelectItem>
                                    <SelectItem value="HAT_GENERAL" className="cursor-pointer">HAT-General</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-semibold flex items-center gap-2 cursor-pointer">
                                <Trophy className="w-4 h-4 text-navy-500" />
                                Degree Level
                            </label>
                            <Select value={level} onValueChange={(val) => val && setLevel(val)}>
                                <SelectTrigger className="w-full h-11 bg-white border-navy-200 hover:border-teal-500 transition-colors cursor-pointer">
                                    <SelectValue placeholder="Select Level" />
                                </SelectTrigger>
                                <SelectContent alignItemWithTrigger={false} sideOffset={8}>
                                    <SelectItem value="MS" className="cursor-pointer">MS / MPhil</SelectItem>
                                    <SelectItem value="PHD" className="cursor-pointer">PhD</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-semibold flex items-center gap-2 cursor-pointer">
                                <Hourglass className="w-4 h-4 text-navy-500" />
                                Exam Mode
                            </label>
                            <Select value={mode} onValueChange={(val) => val && setMode(val)}>
                                <SelectTrigger className="w-full h-11 bg-white border-navy-200 hover:border-teal-500 transition-colors cursor-pointer">
                                    <SelectValue placeholder="Select Mode" />
                                </SelectTrigger>
                                <SelectContent alignItemWithTrigger={false} sideOffset={8}>
                                    <SelectItem value="TESTING" className="cursor-pointer">Testing (Timed, No Answers)</SelectItem>
                                    <SelectItem value="LEARNING" className="cursor-pointer">Learning (Untimed, Explanations)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-semibold flex items-center gap-2 cursor-pointer">
                                <Activity className="w-4 h-4 text-navy-500" />
                                Difficulty
                            </label>
                            <Select value={difficulty} onValueChange={(val) => val && setDifficulty(val)}>
                                <SelectTrigger className="w-full h-11 bg-white border-navy-200 hover:border-teal-500 transition-colors cursor-pointer">
                                    <SelectValue placeholder="Select Difficulty" />
                                </SelectTrigger>
                                <SelectContent alignItemWithTrigger={false} sideOffset={8}>
                                    <SelectItem value="RANDOM" className="cursor-pointer">Random (Mixed)</SelectItem>
                                    <SelectItem value="EASY" className="cursor-pointer">Easy</SelectItem>
                                    <SelectItem value="MEDIUM" className="cursor-pointer">Medium</SelectItem>
                                    <SelectItem value="HARD" className="cursor-pointer">Hard</SelectItem>
                                    <SelectItem value="SUPER_HARD" className="cursor-pointer">Super Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="pt-4 border-t space-y-8">
                        {/* Custom Constraints: Constraints only matter in TESTING mode, but time limit scales */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold cursor-pointer">Number of Questions</label>
                                <Badge variant="secondary">{questionCount[0]}</Badge>
                            </div>
                            <Slider
                                min={10}
                                max={100}
                                step={5}
                                value={questionCount}
                                className="cursor-pointer"
                                onValueChange={(val) => {
                                    const newVal = Array.isArray(val) ? [...val] : [val];
                                    setQuestionCount(newVal);
                                    // Auto scale time if taking full testing
                                    setTimeLimit([Math.round((newVal[0] / 100) * 120)]);
                                }}
                            />
                            <p className="text-xs text-muted-foreground">Reduce for shorter practice sessions.</p>
                        </div>

                        {mode === "TESTING" && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-semibold cursor-pointer">Time Limit (Minutes)</label>
                                    <Badge variant="secondary">{timeLimit[0]} min</Badge>
                                </div>
                                <Slider
                                    min={5}
                                    max={120}
                                    step={5}
                                    value={timeLimit}
                                    className="cursor-pointer"
                                    onValueChange={(val) => setTimeLimit(Array.isArray(val) ? [...val] : [val])}
                                />
                                <p className="text-xs text-muted-foreground">Lower the limit to artificially simulate high pressure.</p>
                            </div>
                        )}
                    </div>

                </CardContent>
                <CardFooter className="bg-navy-50 border-t p-6 mt-4 rounded-b-xl flex justify-between items-center">
                    <p className="text-sm text-muted-foreground hidden sm:block">
                        {mode === "TESTING" ? "Results and XP will be recorded." : "Answers revealed instantly. No XP awarded."}
                    </p>
                    <Button
                        onClick={handleStart}
                        disabled={loading}
                        className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-8 rounded-xl shadow-lg hover:shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                <span>Generating...</span>
                            </div>
                        ) : (
                            mode === "TESTING" ? "Start Test" : "Start Practice"
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
