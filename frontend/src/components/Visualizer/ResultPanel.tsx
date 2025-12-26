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
                    <h2 className="text-xl font-bold text-zinc-900">
                        AI Summary
                    </h2>
                </div>
                {job.summary && (
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-500 font-bold hover:text-blue-600 hover:border-blue-500/30 transition-all shadow-sm"
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
                        className="p-6 bg-white border border-zinc-200 rounded-2xl relative overflow-hidden group shadow-sm"
                    >
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-100 transition-opacity">
                            <div className="w-20 h-20 bg-blue-500/10 blur-3xl rounded-full" />
                        </div>

                        <p className="text-zinc-700 leading-relaxed relative z-10 font-medium">
                            {job.summary}
                        </p>
                    </motion.div>
                ) : job.status === 'failed' ? (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-6 bg-red-50 border border-red-100 rounded-2xl shadow-sm"
                    >
                        <p className="text-red-600 font-bold">Processing Error</p>
                        <p className="text-red-700/60 text-sm mt-1 font-medium">{job.error || 'The background worker encountered an issue.'}</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-12 border border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center gap-4 bg-zinc-50/50"
                    >
                        <div className="w-8 h-8 border-2 border-zinc-200 border-t-blue-600 rounded-full animate-spin" />
                        <p className="text-zinc-400 font-bold italic">Summarization in progress...</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
