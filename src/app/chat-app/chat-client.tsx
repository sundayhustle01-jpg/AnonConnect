'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import type { UserProfile } from '@/lib/types';

const ChatAppClient = dynamic(() => import('@/components/features/ChatClient').then(mod => mod.ChatClient),
    {
        loading: () => <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>,
        ssr: false,
    });

interface ChatAppClientWrapperProps {
    initialStranger: UserProfile | null;
    initialFilters: string | null;
}

export default function ChatAppClientWrapper({ initialStranger, initialFilters }: ChatAppClientWrapperProps) {
    return <ChatAppClient initialStranger={initialStranger} initialFilters={initialFilters} />;
}
