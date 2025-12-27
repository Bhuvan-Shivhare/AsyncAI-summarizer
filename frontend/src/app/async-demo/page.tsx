"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, Server, Send } from "lucide-react";

const API_BASE_URL = "http://localhost:3000";

export default function AsyncDemoPage() {
    const [healthStatus, setHealthStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [healthData, setHealthData] = useState<any>(null);

    const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [submitData, setSubmitData] = useState<any>(null);
    const [inputText, setInputText] = useState("Explain async/await in JavaScript");

    const checkHealth = async () => {
        setHealthStatus("loading");
        setHealthData(null);

        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            await new Promise(resolve => setTimeout(resolve, 600));
            setHealthData(data);
            setHealthStatus("success");
        } catch (error: any) {
            console.error("Health check failed:", error);
            setHealthData({ message: error.message });
            setHealthStatus("error");
        }
    };

    const submitJob = async () => {
        if (!inputText.trim()) return;

        setSubmitStatus("loading");
        setSubmitData(null);

        try {
            const response = await fetch(`${API_BASE_URL}/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    text: inputText,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setSubmitData(data);
            setSubmitStatus("success");
        } catch (error: any) {
            console.error("Submission failed:", error);
            setSubmitData({ error: error.message });
            setSubmitStatus("error");
        }
    };

    return (
        <div className="min-h-screen bg-white text-zinc-900 p-8 font-sans selection:bg-blue-500/10">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header */}
                <header className="space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-extrabold text-zinc-900"
                    >
                        Async/Await & Web APIs
                    </motion.h1>
                    <p className="text-zinc-500 text-lg max-w-2xl font-medium">
                        A demonstration of handling asynchronous operations, API integration, and state management in a modern React application.
                    </p>
                </header>

                <div className="grid md:grid-cols-2 gap-8">

                    {/* Card 1: Health Check (GET) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="border border-zinc-200 bg-white rounded-3xl p-8 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all shadow-sm group"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                <Server className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold">System Status</h2>
                        </div>

                        <p className="text-zinc-500 mb-6 text-sm font-medium leading-relaxed">
                            Performs a simple <code className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">GET</code> request to verify backend connectivity.
                        </p>

                        <button
                            onClick={checkHealth}
                            disabled={healthStatus === "loading"}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95"
                        >
                            {healthStatus === "loading" ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Checking...
                                </>
                            ) : (
                                <>
                                    <Server className="w-5 h-5" />
                                    Check Health
                                </>
                            )}
                        </button>

                        <div className="mt-6">
                            <ResponseDisplay status={healthStatus} data={healthData} />
                        </div>
                    </motion.div>


                    {/* Card 2: Job Submission (POST) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="border border-zinc-200 bg-white rounded-3xl p-8 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/5 transition-all shadow-sm group"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                                <Send className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold">Submit Job</h2>
                        </div>

                        <p className="text-zinc-500 mb-4 text-sm font-medium leading-relaxed">
                            Sends data via <code className="text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">POST</code> to process a request asynchronously.
                        </p>

                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500/30 transition-all resize-none mb-4 font-medium"
                            rows={3}
                            placeholder="Enter text to process..."
                        />

                        <button
                            onClick={submitJob}
                            disabled={submitStatus === "loading" || !inputText.trim()}
                            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95"
                        >
                            {submitStatus === "loading" ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Submit Job
                                </>
                            )}
                        </button>

                        <div className="mt-6">
                            <ResponseDisplay status={submitStatus} data={submitData} />
                        </div>
                    </motion.div>

                </div>

                {/* Educational Section */}
                <section className="border-t border-zinc-100 pt-12">
                    <h3 className="text-2xl font-bold mb-8 text-zinc-900">Understanding the Code</h3>
                    <div className="grid md:grid-cols-2 gap-10 text-sm text-zinc-500">
                        <div className="bg-zinc-50/50 p-6 rounded-2xl border border-zinc-100">
                            <strong className="text-zinc-900 block mb-3 text-base">The `async` keyword</strong>
                            <p className="font-medium leading-relaxed italic">Marks a function as asynchronous, meaning it returns a Promise. This allows us to use `await` inside it.</p>
                        </div>
                        <div className="bg-zinc-50/50 p-6 rounded-2xl border border-zinc-100">
                            <strong className="text-zinc-900 block mb-3 text-base">The `await` keyword</strong>
                            <p className="font-medium leading-relaxed italic">Pauses the function execution until a Promise settles (resolves or rejects). This makes asynchronous code look and behave like synchronous code.</p>
                        </div>
                        <div className="bg-zinc-50/50 p-6 rounded-2xl border border-zinc-100">
                            <strong className="text-zinc-900 block mb-3 text-base">Error Handling</strong>
                            <p className="font-medium leading-relaxed italic">We use `try/catch` blocks. If the API call fails (e.g., 400 Bad Request, 500 Server Error), we throw an error and catch it to update the UI state.</p>
                        </div>
                        <div className="bg-zinc-50/50 p-6 rounded-2xl border border-zinc-100">
                            <strong className="text-zinc-900 block mb-3 text-base">State Management</strong>
                            <p className="font-medium leading-relaxed italic">We use React state (`idle`, `loading`, `success`, `error`) to drive the UI. This provides immediate visual feedback during the asynchronous operation.</p>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}

function ResponseDisplay({ status, data }: { status: string, data: any }) {
    if (status === "idle") return <div className="h-24 flex items-center justify-center text-zinc-400 text-xs font-bold font-mono border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50 uppercase tracking-widest">No request made yet</div>;

    return (
        <AnimatePresence mode="wait">
            {status === "loading" && (
                <motion.div
                    key="loading"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="h-24 flex items-center justify-center text-zinc-500 font-bold text-sm italic"
                >
                    Waiting for response...
                </motion.div>
            )}

            {status === "success" && (
                <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-green-50 border border-green-200 p-4 relative overflow-hidden shadow-sm"
                >
                    <div className="absolute top-2 right-2 text-green-600">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] font-bold text-green-700 mb-2 uppercase tracking-widest">STATUS: 200 OK</p>
                    <pre className="text-xs text-zinc-600 overflow-x-auto font-mono bg-white/50 p-2 rounded-lg border border-green-100">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </motion.div>
            )}

            {status === "error" && (
                <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-red-50 border border-red-200 p-4 relative shadow-sm"
                >
                    <div className="absolute top-2 right-2 text-red-600">
                        <XCircle className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] font-bold text-red-700 mb-2 uppercase tracking-widest">ERROR</p>
                    <pre className="text-xs text-zinc-600 overflow-x-auto font-mono bg-white/50 p-2 rounded-lg border border-red-100">
                        {JSON.stringify(data || "Unknown Error", null, 2)}
                    </pre>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
