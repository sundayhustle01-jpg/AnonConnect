
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, Lightbulb } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React from 'react';
import { useUser } from '@/hooks/use-user';
import { ThemeToggle } from './ThemeToggle';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

type AppHeaderProps = {
  children?: React.ReactNode;
};

export function AppHeader({ children }: AppHeaderProps) {
  const { user } = useUser();
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {children}
          <Link href="/" className="flex items-center gap-2">
            <Image src={`/logo.png?v=${new Date().getTime()}`} alt="CasualFriday" width={160} height={40} />
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {user?.username && (
            <>
              <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
                {user.username}
              </span>
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatar} alt={user.username} />
                <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
              </Avatar>
            </>
          )}
          <div className="hidden sm:flex items-center gap-3">
            <Button variant="ghost" asChild>
                <Link href="/request-feature">
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Request Feature
                </Link>
            </Button>
            <ThemeToggle />
          </div>
          <div className="sm:hidden">
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Menu />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="grid gap-4 p-4">
                    <Link href="/request-feature">
                        <Button variant="outline" className="w-full">
                            <Lightbulb className="mr-2 h-4 w-4" />
                            Request a Feature
                        </Button>
                    </Link>
                    <ThemeToggle />
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </header>
  );
}
