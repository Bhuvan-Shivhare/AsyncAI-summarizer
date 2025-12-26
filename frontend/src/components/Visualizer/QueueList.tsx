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
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Live Jobs</h3>
                <span className="px-2 py-1 bg-zinc-50 rounded-md text-[10px] text-zinc-500 font-bold border border-zinc-200">
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
                                    "p-4 rounded-2xl border transition-all cursor-pointer group shadow-sm",
                                    selectedId === job.id
                                        ? "bg-blue-50 border-blue-500/30 ring-1 ring-blue-500/10"
                                        : "bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-md"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                        job.status === 'completed' && "bg-green-100 text-green-600",
                                        job.status === 'processing' && "bg-blue-100 text-blue-600",
                                        job.status === 'queued' && "bg-amber-100 text-amber-600",
                                        job.status === 'failed' && "bg-red-100 text-red-600"
                                    )}>
                                        {job.status === 'completed' && <CheckCircle2 size={20} />}
                                        {job.status === 'processing' && <RotateCw size={20} className="animate-spin" />}
                                        {job.status === 'queued' && <Clock size={20} />}
                                        {job.status === 'failed' && <AlertCircle size={20} />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-mono text-zinc-400 font-bold flex items-center gap-1">
                                                <Hash size={10} /> {job.id.split('-')[0]}...
                                            </span>
                                            {job.isCacheHit && (
                                                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded uppercase">
                                                    Cache Hit
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-zinc-900 font-bold truncate">
                                            {job.url || job.text?.substring(0, 40) + '...'}
                                        </p>
                                    </div>

                                    {job.status === 'processing' && (
                                        <Activity size={16} className="text-blue-600 animate-pulse" />
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
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
