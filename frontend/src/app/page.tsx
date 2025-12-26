"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Activity, Layers, PlayCircle, BookOpen } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-blue-500/10 font-sans flex flex-col items-center justify-center relative overflow-hidden">

      {/* Background Gradients - Lightened */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[50%] -left-[20%] w-[80%] h-[80%] bg-blue-500/5 blur-[150px] rounded-full" />
        <div className="absolute -bottom-[50%] -right-[20%] w-[80%] h-[80%] bg-purple-500/5 blur-[150px] rounded-full" />
      </div>

      <div className="z-10 text-center max-w-4xl mx-auto px-6 space-y-12">

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-500 text-xs font-bold uppercase tracking-widest shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            System Online
          </div>

          <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-zinc-900 pb-2">
            AsyncAI Architecture
          </h1>

          <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed font-medium">
            Explore the power of asynchronous processing. Choose between a visual demonstration of the system architecture or a simplified coding tutorial.
          </p>
        </motion.div>

        {/* Card Grid */}
        <div className="grid md:grid-cols-2 gap-6 w-full">

          {/* Card 1: System Visualizer */}
          <Link href="/visualizer" className="group">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="h-full p-8 rounded-3xl bg-white border border-zinc-200 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group-hover:-translate-y-2 relative overflow-hidden flex flex-col items-start gap-4 shadow-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                <Layers size={32} />
              </div>

              <div className="text-left space-y-2 relative z-10">
                <h2 className="text-2xl font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">
                  System Visualizer
                </h2>
                <p className="text-zinc-500 text-sm leading-relaxed font-medium">
                  Watch jobs move through queues, workers, and caches in real-time. Understand the full backend architecture.
                </p>
              </div>

              <div className="mt-auto pt-6 flex items-center text-sm font-bold text-zinc-400 group-hover:text-blue-600 transition-colors uppercase tracking-widest">
                LAUNCH APP <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </Link>

          {/* Card 2: Async Demo */}
          <Link href="/async-demo" className="group">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="h-full p-8 rounded-3xl bg-white border border-zinc-200 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 group-hover:-translate-y-2 relative overflow-hidden flex flex-col items-start gap-4 shadow-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-600 group-hover:scale-110 transition-transform duration-300">
                <BookOpen size={32} />
              </div>

              <div className="text-left space-y-2 relative z-10">
                <h2 className="text-2xl font-bold text-zinc-900 group-hover:text-purple-600 transition-colors">
                  Code Concepts
                </h2>
                <p className="text-zinc-500 text-sm leading-relaxed font-medium">
                  A simplified "Async/Await" playground. Learn how modern web APIs handle requests, loading states, and errors.
                </p>
              </div>

              <div className="mt-auto pt-6 flex items-center text-sm font-bold text-zinc-400 group-hover:text-purple-600 transition-colors uppercase tracking-widest">
                START TUTORIAL <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </Link>

        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="pt-12 flex justify-center gap-8 border-t border-zinc-100 w-full"
        >
          <div className="flex flex-col items-center gap-1 text-zinc-400">
            <Activity className="w-5 h-5 mb-1" />
            <span className="text-[10px] uppercase font-bold tracking-widest">Real-time</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-zinc-400">
            <PlayCircle className="w-5 h-5 mb-1" />
            <span className="text-[10px] uppercase font-bold tracking-widest">Interactive</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
