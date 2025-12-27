'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    RotateCw,
    Hash,
    Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Job } from '@/types';

interface QueueListProps {
    jobs: Job[];
    onSelect: (job: Job) => void;
    selectedId?: string;
}

export const QueueList = ({ jobs, onSelect, selectedId }: QueueListProps) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Live Jobs</h3>
                <span className="px-3 py-1 bg-zinc-50 rounded-full text-[10px] text-zinc-500 font-extrabold border border-zinc-200 shadow-sm">
                    {jobs.length} ACTIVE
                </span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {jobs.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-12 text-center text-zinc-400 italic text-sm font-medium"
                        >
                            No active jobs in queue.
                        </motion.div>
                    ) : (
                        jobs.map((job) => (
                            <motion.div
                                key={job.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onClick={() => onSelect(job)}
                                className={cn(
                                    "p-5 rounded-3xl border transition-all cursor-pointer group",
                                    selectedId === job.id
                                        ? "bg-blue-50 border-blue-200 shadow-lg shadow-blue-500/5 ring-2 ring-blue-500/10"
                                        : "bg-white border-zinc-100 hover:border-zinc-200 hover:shadow-md"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm",
                                        job.status === 'completed' && "bg-green-50 text-green-600 border border-green-100",
                                        job.status === 'processing' && "bg-blue-100 text-blue-600 border border-blue-200",
                                        job.status === 'queued' && "bg-amber-50 text-amber-600 border border-amber-100",
                                        job.status === 'failed' && "bg-red-50 text-red-600 border border-red-100"
                                    )}>
                                        {job.status === 'completed' && <CheckCircle2 size={24} />}
                                        {job.status === 'processing' && <RotateCw size={24} className="animate-spin" />}
                                        {job.status === 'queued' && <Clock size={24} />}
                                        {job.status === 'failed' && <AlertCircle size={24} />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold font-mono text-zinc-400 flex items-center gap-1 uppercase tracking-tighter">
                                                <Hash size={10} /> {job.id.split('-')[0]}
                                            </span>
                                            {job.isCacheHit && (
                                                <span className="text-[9px] font-black bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                                                    Hit
                                                </span>
                                            )}
                                        </div>
                                        <p className={cn(
                                            "text-sm font-bold truncate",
                                            selectedId === job.id ? "text-blue-700" : "text-zinc-700"
                                        )}>
                                            {job.url || job.text?.substring(0, 40) + '...'}
                                        </p>
                                    </div>

                                    {job.status === 'processing' && (
                                        <div className="relative">
                                            <Activity size={18} className="text-blue-500 animate-pulse" />
                                            <div className="absolute inset-0 bg-blue-500/20 blur-md rounded-full animate-ping" />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f4f4f5;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e4e4e7;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4d4d8;
        }
      `}</style>
        </div>
    );
};
