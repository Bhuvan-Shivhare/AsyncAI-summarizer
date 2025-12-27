'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Job } from '@/types';
import { cn } from '@/lib/utils';

export const ResultPanel = ({ job }: { job?: Job }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!job?.summary) return;
        navigator.clipboard.writeText(job.summary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!job) return null;

    return (
        <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="text-blue-600" size={20} />
                    <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
                        AI Summary
                    </h2>
                </div>
                {job.summary && (
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-500 font-bold hover:text-blue-600 hover:border-blue-500/30 transition-all shadow-sm"
                    >
                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {job.status === 'completed' ? (
                    <motion.div
                        key="summary"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-8 bg-white border border-zinc-200 rounded-3xl relative overflow-hidden group shadow-sm"
                    >
                        {/* Subtle blue accent in the corner */}
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-100 transition-opacity">
                            <div className="w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full" />
                        </div>

                        <p className="text-zinc-700 leading-relaxed relative z-10 font-medium text-lg">
                            {job.summary}
                        </p>
                    </motion.div>
                ) : job.status === 'failed' ? (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-8 bg-red-50 border border-red-100 rounded-3xl shadow-sm"
                    >
                        <p className="text-red-600 font-bold text-lg">Processing Error</p>
                        <p className="text-red-700/70 text-sm mt-2 font-medium leading-relaxed">{job.error || 'The background worker encountered an issue while summarizing this content.'}</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-16 border border-dashed border-zinc-200 rounded-3xl flex flex-col items-center justify-center gap-4 bg-zinc-50/30"
                    >
                        <div className="w-10 h-10 border-4 border-zinc-100 border-t-blue-600 rounded-full animate-spin" />
                        <p className="text-zinc-400 font-bold italic tracking-wide">Summarization in progress...</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
