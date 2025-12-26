'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Server,
    Layers,
    Cpu,
    Database,
    Zap,
    BrainCircuit,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Job } from '@/types';

interface NodeProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    status?: 'pending' | 'active' | 'success' | 'error';
    subLabel?: string;
    color?: string;
}

const Node = ({ icon, label, status = 'pending', subLabel, color = 'blue' }: NodeProps) => {
    const colors = {
        blue: 'border-blue-500/20 text-blue-600 bg-blue-50',
        green: 'border-green-500/20 text-green-600 bg-green-50',
        amber: 'border-amber-500/20 text-amber-600 bg-amber-50',
        red: 'border-red-500/20 text-red-600 bg-red-50',
    };

    const activeColors = {
        pending: 'opacity-50 grayscale bg-zinc-50 border-zinc-200',
        active: 'opacity-100 ring-4 ring-blue-500/10 shadow-lg border-blue-500/50',
        success: 'opacity-100 border-current shadow-sm',
        error: 'opacity-100 border-current shadow-sm',
    };

    return (
        <div className="flex flex-col items-center gap-2 relative">
            <motion.div
                layout
                className={cn(
                    "w-16 h-16 rounded-2xl border flex items-center justify-center transition-all duration-500",
                    colors[color as keyof typeof colors],
                    activeColors[status]
                )}
            >
                {icon}
                {status === 'active' && (
                    <motion.div
                        className="absolute inset-0 rounded-2xl border-2 border-blue-400"
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 1.2, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                )}
            </motion.div>
            <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-900">{label}</p>
                {subLabel && <p className="text-[10px] text-zinc-500 font-bold">{subLabel}</p>}
            </div>
        </div>
    );
};

export const SystemFlow = ({ activeJob }: { activeJob?: Job }) => {
    const isCacheHit = activeJob?.isCacheHit;

    const getStatus = (step: string) => {
        if (!activeJob) return 'pending';
        if (activeJob.status === 'completed') return 'success';
        if (activeJob.status === 'failed') return 'error';
        if (activeJob.step === step) return 'active';

        const steps = ['client', 'api', 'queue', 'worker', 'cache', 'llm', 'db'];
        const currentIndex = steps.indexOf(activeJob.step || 'client');
        const stepIndex = steps.indexOf(step);

        return stepIndex < currentIndex ? 'success' : 'pending';
    };

    return (
        <div className="w-full py-12 px-6 bg-white rounded-3xl border border-zinc-200 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-50/50 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between max-w-5xl mx-auto relative z-10">
                {/* Connection Line */}
                <div className="absolute top-8 left-8 right-8 h-[2px] bg-zinc-100 -z-10">
                    <motion.div
                        className="h-full bg-blue-500"
                        initial={{ width: "0%" }}
                        animate={{
                            width: activeJob ? (
                                activeJob.status === 'completed' ? "100%" :
                                    activeJob.step === 'api' ? "20%" :
                                        activeJob.step === 'queue' ? "40%" :
                                            activeJob.step === 'worker' ? "60%" :
                                                activeJob.step === 'cache' ? "75%" :
                                                    activeJob.step === 'llm' ? "85%" :
                                                        activeJob.step === 'db' ? "95%" : "0%"
                            ) : "0%"
                        }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                    />
                </div>

                <Node
                    icon={<User size={24} />}
                    label="Client"
                    status={getStatus('client')}
                    subLabel="Request"
                />

                <ArrowRight size={16} className="text-zinc-300 mt-[-20px]" />

                <Node
                    icon={<Server size={24} />}
                    label="API"
                    status={getStatus('api')}
                    subLabel="Express"
                />

                <ArrowRight size={16} className="text-zinc-300 mt-[-20px]" />

                <Node
                    icon={<Layers size={24} />}
                    label="Queue"
                    status={getStatus('queue')}
                    subLabel="BullMQ"
                />

                <ArrowRight size={16} className="text-zinc-300 mt-[-20px]" />

                <Node
                    icon={<Cpu size={24} />}
                    label="Worker"
                    status={getStatus('worker')}
                    subLabel="Background"
                />

                <ArrowRight size={16} className="text-zinc-300 mt-[-20px]" />

                <Node
                    icon={<Zap size={24} />}
                    label="Cache"
                    status={activeJob?.isCacheHit !== undefined ? 'success' : getStatus('cache')}
                    color={activeJob?.isCacheHit === true ? 'green' : activeJob?.isCacheHit === false ? 'red' : 'amber'}
                    subLabel={activeJob?.isCacheHit === true ? 'HIT' : activeJob?.isCacheHit === false ? 'MISS' : 'Redis'}
                />

                {activeJob?.isCacheHit !== true && (
                    <>
                        <ArrowRight size={16} className="text-zinc-300 mt-[-20px]" />
                        <Node
                            icon={<BrainCircuit size={24} />}
                            label="LLM"
                            status={getStatus('llm')}
                            subLabel="Groq"
                        />
                    </>
                )}

                <ArrowRight size={16} className="text-zinc-300 mt-[-20px]" />

                <Node
                    icon={<Database size={24} />}
                    label="Database"
                    status={getStatus('db')}
                    subLabel="PostgreSQL"
                />
            </div>

            <div className="mt-12 flex justify-center relative z-10">
                <AnimatePresence mode="wait">
                    {activeJob && (
                        <motion.div
                            key={activeJob.id + activeJob.step}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-zinc-600 text-sm font-bold flex items-center gap-2"
                        >
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            {activeJob.step === 'client' && "Waiting for user input..."}
                            {activeJob.step === 'api' && "API accepted request. Returning jobId immediately."}
                            {activeJob.step === 'queue' && "Job added to BullMQ. Worker will pick it up next."}
                            {activeJob.step === 'worker' && "Worker is processing the job in the background."}
                            {activeJob.step === 'cache' && "Checking Redis for existing summary..."}
                            {activeJob.step === 'llm' && isCacheHit === false && "Cache MISS. Invoking Groq LLM (Llama 3.1) for summarization..."}
                            {activeJob.step === 'db' && "Summarization complete. Saving result to PostgreSQL."}
                            {activeJob.status === 'completed' && "Job finished! System design demonstrated."}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
