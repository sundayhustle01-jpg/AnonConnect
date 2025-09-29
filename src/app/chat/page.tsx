import { ChatClient } from '@/components/features/ChatClient';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default function ChatPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ChatClient />
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
