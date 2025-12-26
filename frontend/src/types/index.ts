export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface CacheInfo {
    isCached: boolean;
    expiresInMinutes: number | null;
    remainingSeconds: number | null;
}

export interface Job {
    id: string;
    status: JobStatus;
    url?: string;
    text?: string;
    summary?: string;
    processingTime?: string;
    isCacheHit?: boolean;
    cacheInfo?: CacheInfo;
    error?: string;
    step?: 'client' | 'api' | 'queue' | 'worker' | 'cache' | 'llm' | 'db' | 'completed';
}
