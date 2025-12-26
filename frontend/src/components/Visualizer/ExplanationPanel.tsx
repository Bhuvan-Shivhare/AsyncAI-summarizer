'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Terminal, FastForward, Settings2 } from 'lucide-react';
import { Job } from '@/types';
import { cn } from '@/lib/utils';

export const ExplanationPanel = ({ activeJob }: { activeJob?: Job }) => {
    const isCacheHit = activeJob?.isCacheHit;

    const content = {
        queued: {
            title: "Asynchronous Enqueuing",
            desc: "The Express API received the request and immediately returned a jobId. It did not wait for the LLM. Instead, it pushed the job into BullMQ (Redis).",
            icon: <Terminal className="text-amber-500" size={20} />
        },
        processing: {
            title: "Background Worker Active",
            desc: "A separate Node.js worker process picked up the job from the queue. This keeps the main API thread free to handle 1000s of other user requests.",
            icon: <Settings2 className="text-blue-500" size={20} />
        },
        completed: {
            title: "Job Resolved Successfully",
            desc: isCacheHit
                ? "Fast-path! Redis cache found a matching input hash. We skipped the expensive LLM call entirely, saving money and time."
                : "Groq LLM (Llama 3.1) successfully summarized the content in the background and persisted it to PostgreSQL.",
            icon: <FastForward className="text-green-500" size={20} />
        },
        failed: {
            title: "Graceful Failure",
            desc: "An error occurred during processing. The system caught it, updated the job status in the DB, and remained stable. The worker process did not crash.",
            icon: <Info className="text-red-500" size={20} />
        }
    };

    const getExplanation = () => {
        if (!activeJob) return {
            title: "System Ready",
            desc: "Submit a URL or text to see how the async architecture, BullMQ worker, Redis caching, and Groq LLM work together.",
            icon: <Info className="text-zinc-400" size={20} />
        };

        const status = activeJob.status;
        return content[status as keyof typeof content] || content.processing;
    };

    const current = getExplanation();

    return (
        <div className="p-6 bg-white border border-zinc-200 rounded-2xl h-full shadow-sm">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current.title}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-50 rounded-lg border border-zinc-100 shadow-sm">
                            {current.icon}
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900">{current.title}</h3>
                    </div>
                    <p className="text-zinc-500 leading-relaxed font-medium">
                        {current.desc}
                    </p>

                    {activeJob && (
                        <div className="pt-4 border-t border-zinc-100 space-y-3">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-400">
                                <span>Metadata</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold font-mono">
                                <div className="bg-zinc-50 p-2 rounded border border-zinc-200 shadow-sm">
                                    <p className="text-zinc-400 mb-1 uppercase">Job ID</p>
                                    <p className="text-zinc-700 truncate">{activeJob.id}</p>
                                </div>
                                <div className="bg-zinc-50 p-2 rounded border border-zinc-200 shadow-sm">
                                    <p className="text-zinc-400 mb-1 uppercase">Type</p>
                                    <p className="text-zinc-700">{activeJob.url ? 'URL' : 'TEXT'}</p>
                                </div>
                                {activeJob.processingTime && (
                                    <div className="bg-zinc-50 p-2 rounded border border-zinc-200 shadow-sm">
                                        <p className="text-zinc-400 mb-1 uppercase">Processing</p>
                                        <p className="text-zinc-700">{activeJob.processingTime}</p>
                                    </div>
                                )}
                                <div className="bg-zinc-50 p-2 rounded border border-zinc-200 shadow-sm">
                                    <p className="text-zinc-400 mb-1 uppercase">Cache Status</p>
                                    <p className={cn("font-bold", activeJob.isCacheHit ? "text-green-600" : "text-amber-600")}>
                                        {activeJob.isCacheHit === true ? 'HIT' : 'MISS'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
