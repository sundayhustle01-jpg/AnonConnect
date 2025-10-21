import { ChatClient } from '@/components/features/ChatClient';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// The chat page now simply renders the client, which handles all logic.
// The initial stranger and filters are passed via search params if they exist,
// but the server no longer pre-fetches a stranger.
export default function ChatPage({ searchParams }: any) {
  const initialStranger =
    typeof searchParams.stranger === 'string' ? JSON.parse(searchParams.stranger) : null;
  const initialFilters =
    typeof searchParams.filters === 'string' ? searchParams.filters : null;

  return (
    <Suspense fallback={<LoadingState />}>
      <ChatClient initialStranger={initialStranger} initialFilters={initialFilters} />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
