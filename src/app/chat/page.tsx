import { ChatClient } from '@/components/features/ChatClient';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { UserProfile, SearchFilters } from '@/lib/types';
import { findStranger as findStrangerAction } from '@/app/actions';

async function getInitialStranger(
  strangerParam: string | null,
  filtersParam: string | null,
  userId: string | undefined
): Promise<UserProfile> {
  if (strangerParam) {
    try {
      const passedStranger: UserProfile = JSON.parse(strangerParam);
      return passedStranger;
    } catch (error) {
      console.error('Failed to parse stranger from URL, finding random.', error);
    }
  }

  if (filtersParam) {
    try {
      const filters: SearchFilters = JSON.parse(filtersParam);
      const { stranger } = await findStrangerAction(filters, userId);
      return stranger;
    } catch (error) {
      console.error('Failed to parse filters from URL, finding random.', error);
    }
  }

  const { stranger } = await findStrangerAction({}, userId);
  return stranger;
}

// We can't get user from useUser hook on the server, so we'll pass initial data down.
// This example doesn't have real auth, so we pass undefined for the userId.
// In a real app, you'd get the session here.
export default async function ChatPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const strangerParam =
    typeof searchParams.stranger === 'string' ? searchParams.stranger : null;
  const filtersParam =
    typeof searchParams.filters === 'string' ? searchParams.filters : null;

  const initialStranger = await getInitialStranger(strangerParam, filtersParam, undefined);
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
