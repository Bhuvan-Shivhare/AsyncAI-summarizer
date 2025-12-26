'use client';

import React, { useState } from 'react';
import { Send, Globe, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputSectionProps {
    onSubmit: (data: { url?: string; text?: string }) => void;
    isLoading: boolean;
}

export const InputSection = ({ onSubmit, isLoading }: InputSectionProps) => {
    const [mode, setMode] = useState<'url' | 'text'>('url');
    const [value, setValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!value.trim()) return;
        onSubmit(mode === 'url' ? { url: value } : { text: value });
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <div className="flex p-1 bg-zinc-50 border border-zinc-200 rounded-xl w-fit mx-auto shadow-sm">
                <button
                    onClick={() => setMode('url')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all focus:outline-none",
                        mode === 'url' ? "bg-white text-blue-600 shadow-sm border border-zinc-200" : "text-zinc-500 hover:text-zinc-700"
                    )}
                >
                    <Globe size={16} /> URL
                </button>
                <button
                    onClick={() => setMode('text')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all focus:outline-none",
                        mode === 'text' ? "bg-white text-blue-600 shadow-sm border border-zinc-200" : "text-zinc-500 hover:text-zinc-700"
                    )}
                >
                    <FileText size={16} /> Text
                </button>
            </div>

            <form onSubmit={handleSubmit} className="relative group">
                {mode === 'url' ? (
                    <input
                        type="url"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Enter article URL (e.g. https://example.com)"
                        required
                        className="w-full bg-white border border-zinc-200 rounded-2xl py-5 pl-6 pr-16 text-lg text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 transition-all shadow-sm font-medium"
                    />
                ) : (
                    <textarea
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Paste your text content here..."
                        required
                        rows={4}
                        className="w-full bg-white border border-zinc-200 rounded-2xl py-5 pl-6 pr-16 text-lg text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 transition-all resize-none shadow-sm font-medium"
                    />
                )}

                <button
                    type="submit"
                    disabled={isLoading || !value.trim()}
                    className="absolute right-3 bottom-3 top-auto hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-50 p-3 bg-blue-600 rounded-xl text-white transition-all shadow-lg shadow-blue-500/20"
                >
                    {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                </button>
            </form>
        </div>
    );
};
