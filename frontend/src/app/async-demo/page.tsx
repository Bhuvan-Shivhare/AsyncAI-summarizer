"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, Server, Send } from "lucide-react";

// Define the base URL for the backend API
// Ensure your backend is running on this port (default is 3000)
// If frontend is also on 3000, run frontend on 3001: npm run dev -- -p 3001
const API_BASE_URL = "http://localhost:3000";

export default function AsyncDemoPage() {
    // State for Health Check
    const [healthStatus, setHealthStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [healthData, setHealthData] = useState<any>(null);

    // State for Job Submission
    const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [submitData, setSubmitData] = useState<any>(null);
    const [inputText, setInputText] = useState("Explain async/await in JavaScript");

    // 1. Example of a simple GET request
    const checkHealth = async () => {
        setHealthStatus("loading"); // Start loading state
        setHealthData(null);

        try {
            // API Call using fetch
            // We use 'await' to pause execution until the promise resolves
            const response = await fetch(`${API_BASE_URL}/health`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // We also await the JSON parsing
            const data = await response.json();

            // Simulate a small delay simply to let you see the loading spinner
            await new Promise(resolve => setTimeout(resolve, 600));

            setHealthData(data);
            setHealthStatus("success");
        } catch (error: any) {
            console.error("Health check failed:", error);
            setHealthData({ message: error.message });
            setHealthStatus("error");
        }
    };

    // 2. Example of a POST request with payload
    const submitJob = async () => {
        if (!inputText.trim()) return;

        setSubmitStatus("loading");
        setSubmitData(null);

        try {
            // API Call
            const response = await fetch(`${API_BASE_URL}/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                // We only send 'text' because the backend validation requires EITHER text OR url, not both.
                body: JSON.stringify({
                    text: inputText,
                }),
            });

            if (!response.ok) {
                // Attempt to parse error message from server
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
        <div className="min-h-screen bg-black text-white p-8 font-sans selection:bg-purple-500/30">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header */}
                <header className="space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"
                    >
                        Async/Await & Web APIs
                    </motion.h1>
                    <p className="text-gray-400 text-lg max-w-2xl">
                        A demonstration of handling asynchronous operations, API integration, and state management in a modern React application.
                    </p>
                </header>

                <div className="grid md:grid-cols-2 gap-8">

                    {/* Card 1: Health Check (GET) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="border border-gray-800 bg-gray-900/50 rounded-2xl p-6 backdrop-blur-sm hover:border-blue-500/50 transition-colors"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                                <Server className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-semibold">System Status</h2>
                        </div>

                        <p className="text-gray-400 mb-6 text-sm">
                            Performs a simple <code className="text-blue-300">GET</code> request to verify backend connectivity.
                        </p>

                        <button
                            onClick={checkHealth}
                            disabled={healthStatus === "loading"}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed rounded-xl font-medium transition-all flex items-center justify-center gap-2 group"
                        >
                            {healthStatus === "loading" ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Checking...
                                </>
                            ) : (
                                <>
                                    <Server className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    Check Health
                                </>
                            )}
                        </button>

                        {/* Response Display */}
                        <div className="mt-6">
                            <ResponseDisplay status={healthStatus} data={healthData} />
                        </div>
                    </motion.div>


                    {/* Card 2: Job Submission (POST) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="border border-gray-800 bg-gray-900/50 rounded-2xl p-6 backdrop-blur-sm hover:border-purple-500/50 transition-colors"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
                                <Send className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-semibold">Submit Job</h2>
                        </div>

                        <p className="text-gray-400 mb-4 text-sm">
                            Sends data via <code className="text-purple-300">POST</code> to process a request asynchronously.
                        </p>

                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-sm text-gray-200 focus:outline-none focus:border-purple-500 transition-colors resize-none mb-4"
                            rows={3}
                            placeholder="Enter text to process..."
                        />

                        <button
                            onClick={submitJob}
                            disabled={submitStatus === "loading" || !inputText.trim()}
                            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 disabled:cursor-not-allowed rounded-xl font-medium transition-all flex items-center justify-center gap-2 group"
                        >
                            {submitStatus === "loading" ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                    Submit Job
                                </>
                            )}
                        </button>

                        {/* Response Display */}
                        <div className="mt-6">
                            <ResponseDisplay status={submitStatus} data={submitData} />
                        </div>
                    </motion.div>

                </div>

                {/* Educational Section */}
                <section className="border-t border-gray-800 pt-8">
                    <h3 className="text-xl font-semibold mb-4 text-gray-300">Understanding the Code</h3>
                    <div className="grid md:grid-cols-2 gap-8 text-sm text-gray-400">
                        <div>
                            <strong className="text-white block mb-2">The `async` keyword</strong>
                            <p>Marks a function as asynchronous, meaning it returns a Promise. This allows us to use `await` inside it.</p>
                        </div>
                        <div>
                            <strong className="text-white block mb-2">The `await` keyword</strong>
                            <p>Pauses the function execution until a Promise settles (resolves or rejects). This makes asynchronous code look and behave like synchronous code.</p>
                        </div>
                        <div>
                            <strong className="text-white block mb-2">Error Handling</strong>
                            <p>We use `try/catch` blocks. If the API call fails (e.g., 400 Bad Request, 500 Server Error), we throw an error and catch it to update the UI state.</p>
                        </div>
                        <div>
                            <strong className="text-white block mb-2">State Management</strong>
                            <p>We use React state (`idle`, `loading`, `success`, `error`) to drive the UI. This provides immediate visual feedback during the asynchronous operation.</p>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}

// Helper Component for displaying API responses
function ResponseDisplay({ status, data }: { status: string, data: any }) {
    if (status === "idle") return <div className="h-24 flex items-center justify-center text-gray-600 text-sm border border-dashed border-gray-800 rounded-lg">No request made yet</div>;

    return (
        <AnimatePresence mode="wait">
            {status === "loading" && (
                <motion.div
                    key="loading"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="h-24 flex items-center justify-center text-gray-400"
                >
                    Waiting for response...
                </motion.div>
            )}

            {status === "success" && (
                <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 relative overflow-hidden"
                >
                    <div className="absolute top-2 right-2 text-green-500">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-mono text-green-400 mb-1">STATUS: 200 OK</p>
                    <pre className="text-xs text-gray-300 overflow-x-auto">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </motion.div>
            )}

            {status === "error" && (
                <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 relative"
                >
                    <div className="absolute top-2 right-2 text-red-500">
                        <XCircle className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-mono text-red-400 mb-1">ERROR</p>
                    <pre className="text-xs text-gray-300 overflow-x-auto">
                        {JSON.stringify(data || "Unknown Error", null, 2)}
                    </pre>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
