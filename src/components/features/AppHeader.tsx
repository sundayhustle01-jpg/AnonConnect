import Link from 'next/link';
import { MessageSquareText } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React from 'react';

type AppHeaderProps = {
  user?: UserProfile | null;
  children?: React.ReactNode;
};

export function AppHeader({ user, children }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {children}
          <Link href="/" className="flex items-center gap-2">
            <MessageSquareText className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">AnonConnect</span>
          </Link>
        </div>
        {user?.username && (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
              {user.username}
            </span>
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </header>
  );
}
