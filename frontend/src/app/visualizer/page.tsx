'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Activity, LayoutDashboard, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InputSection } from '@/components/Visualizer/InputSection';
import { SystemFlow } from '@/components/Visualizer/SystemFlow';
import { QueueList } from '@/components/Visualizer/QueueList';
import { ExplanationPanel } from '@/components/Visualizer/ExplanationPanel';
import { ResultPanel } from '@/components/Visualizer/ResultPanel';
import { api } from '@/lib/api';
import { Job } from '@/types';

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const pollIntervals = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  const updateJobStep = (job: Job) => {
    if (job.status === 'queued') return 'queue';
    if (job.status === 'processing') return 'worker';
    if (job.status === 'completed') return 'completed';
    if (job.status === 'failed') return 'completed';
    return job.step || 'client';
  };

  const pollJobStatus = async (jobId: string) => {
    try {
      const statusRes = await api.getStatus(jobId);
      setJobs(prev => prev.map(job => {
        if (job.id === jobId) {
          const newStatus = statusRes.status;
          const currentStep = updateJobStep({ ...job, status: newStatus });
          return {
            ...job,
            status: newStatus,
            isCacheHit: statusRes.isCacheHit,
            step: currentStep === 'worker' ? 'cache' : currentStep
          };
        }
        return job;
      }));

      if (statusRes.status === 'completed' || statusRes.status === 'failed') {
        const resultRes = await api.getResult(jobId);
        setJobs(prev => prev.map(job => {
          if (job.id === jobId) {
            return {
              ...job,
              status: statusRes.status,
              summary: resultRes.summary,
              processingTime: resultRes.processingTime,
              isCacheHit: resultRes.isCacheHit,
              cacheInfo: resultRes.cacheInfo,
              error: resultRes.error,
              step: 'completed'
            };
          }
          return job;
        }));

        if (pollIntervals.current[jobId]) {
          clearInterval(pollIntervals.current[jobId]);
          delete pollIntervals.current[jobId];
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  };

  const handleSubmit = async (data: { url?: string; text?: string }) => {
    setIsSubmitting(true);
    try {
      const res = await api.submit(data);
      const newJob: Job = {
        id: res.jobId,
        status: 'queued',
        step: 'api',
        url: data.url,
        text: data.text
      };
      setJobs(prev => [newJob, ...prev]);
      setSelectedJobId(res.jobId);
      setTimeout(() => {
        setJobs(prev => prev.map(j => j.id === res.jobId ? { ...j, step: 'queue' } : j));
      }, 800);
      const interval = setInterval(() => pollJobStatus(res.jobId), 2000);
      pollIntervals.current[res.jobId] = interval;
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.getHealth();
        setIsOnline(res.status === 'ok');
      } catch (e) {
        setIsOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      clearInterval(interval);
      Object.values(pollIntervals.current).forEach(clearInterval);
    };
  }, []);

  return (
    <main className="min-h-screen bg-white text-zinc-900 selection:bg-blue-500/10 font-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/10">
              <BrainCircuit className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-zinc-900">AsyncAI Summarizer</h1>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">System Visualizer</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                isOnline ? "bg-green-500" : "bg-red-500"
              )} />
              <span className="text-xs text-zinc-500 font-bold">
                API: {isOnline ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="text-zinc-400" size={16} />
              <span className="text-xs text-zinc-500 font-bold">0.8s AVG</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-12">
          <section className="space-y-4">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold text-zinc-900">What would you like to summarize?</h2>
              <p className="text-zinc-500 max-w-md mx-auto font-medium">Submit content to see exactly how our asynchronous architecture processes it in the background.</p>
            </div>
            <InputSection onSubmit={handleSubmit} isLoading={isSubmitting} />
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Live System Flow</h3>
              <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase">
                <span>Auto-Visualizing</span>
                <span className="w-4 h-[1px] bg-zinc-200" />
              </div>
            </div>
            <SystemFlow activeJob={selectedJob} />
          </section>

          <ResultPanel job={selectedJob} />
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-8">
          <section>
            <QueueList
              jobs={jobs}
              onSelect={(job) => setSelectedJobId(job.id)}
              selectedId={selectedJobId || undefined}
            />
          </section>

          <section className="sticky top-[100px]">
            <ExplanationPanel activeJob={selectedJob} />
            <div className="mt-6 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 shadow-sm">
              <div className="flex items-center gap-2 text-blue-600 mb-2 font-bold">
                <LayoutDashboard size={16} />
                <h4 className="text-xs uppercase tracking-wider">Architecture Note</h4>
              </div>
              <p className="text-[11px] text-blue-700/70 leading-relaxed font-medium">
                This UI uses polling to simulate a real-time reactive interface. In a production environment, we might use WebSockets or Server-Sent Events (SSE) for even faster updates.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
