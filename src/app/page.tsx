'use client';

import Link from 'next/link';
import { ArrowRight, Loader2, MessageCircle, Pencil } from 'lucide-react';
import { AppHeader } from '@/components/features/AppHeader';
import { ProfileSetup } from '@/components/features/ProfileSetup';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/use-user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function HomePage() {
  const { user, strangersHistory, isLoaded } = useUser();

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
      <main className="container mx-auto flex flex-1 flex-col items-center justify-center p-4">
        {user?.username ? (
          <div className="flex flex-col items-center gap-4 animate-fade-in w-full max-w-xl">
             <div className="flex w-full gap-2">
              <Button asChild size="lg" className="w-full font-bold shadow-lg shadow-primary/20">
                <Link href="/chat">
                  Start Random Chat
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="lg" className="shadow-lg">
                    <Pencil className="h-5 w-5" />
                    <span className="sr-only">Edit Profile</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Update your profile information.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-[70vh] overflow-y-auto p-1">
                    <ProfileSetup />
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {strangersHistory && strangersHistory.length > 0 && (
              <Card className="mt-8 w-full animate-fade-in-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="text-primary"/>
                    Recent Conversations
                  </CardTitle>
                  <CardDescription>People you have recently chatted with.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {strangersHistory.map((stranger) => (
                         <div key={stranger.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={stranger.avatar} alt={stranger.username} />
                                <AvatarFallback>{stranger.username.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className='text-left'>
                                <p className="font-bold text-md">{stranger.username}</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <ProfileSetup />
        )}
      </main>
    </div>
  );
}
