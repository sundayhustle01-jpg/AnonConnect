
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const ChatAppClient = dynamic(() => import('@/components/features/ChatClient').then(mod => mod.ChatClient),
    {
        loading: () => <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>,
        ssr: false,
    });

export default function ChatPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const initialStranger = searchParams.stranger ? JSON.parse(decodeURIComponent(searchParams.stranger as string)) : null;
    const initialFilters = searchParams.filters ? decodeURIComponent(searchParams.filters as string) : null;

    return <ChatAppClient initialStranger={initialStranger} initialFilters={initialFilters} />;
}
