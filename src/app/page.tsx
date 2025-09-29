'use client';

import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { AppHeader } from '@/components/features/AppHeader';
import { ProfileSetup } from '@/components/features/ProfileSetup';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/use-user';

export default function HomePage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader user={user} />
      <main className="container mx-auto flex flex-1 flex-col items-center justify-center p-4 text-center">
        {user?.username ? (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              Welcome, <span className="text-primary">{user.username}</span>
            </h1>
            <p className="mt-2 max-w-xl text-lg text-muted-foreground">
              Ready to connect with someone new? Click the button below to start a conversation with a random stranger.
            </p>
            <Button asChild size="lg" className="mt-6 font-bold shadow-lg shadow-primary/20">
              <Link href="/chat">
                Start Random Chat
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        ) : (
          <ProfileSetup />
        )}
      </main>
    </div>
  );
}
