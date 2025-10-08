
'use client';

import { ArrowLeft, Loader2, Star, MessageSquareText } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/hooks/use-user';
import { AppHeader } from '@/components/features/AppHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';

export default function FavoritesPage() {
  const { user, favorites, isLoaded } = useUser();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isLoaded || !isClient) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader user={user}>
         <Button variant="ghost" size="icon" asChild aria-label="Back to chat">
            <Link href="/chat-app">
                <ArrowLeft className="h-5 w-5" />
            </Link>
        </Button>
      </AppHeader>
      <main className="container mx-auto flex-1 p-4">
        <Card className="w-full max-w-2xl mx-auto animate-fade-in-up">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Star className="text-primary"/>
                    Favorite Users
                </CardTitle>
                <CardDescription>
                    Your list of favorite people to chat with.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {favorites.length > 0 ? (
                    <div className="flex flex-col gap-1">
                        {favorites.map((stranger) => (
                             <Link key={stranger.id} href={`/chat?stranger=${encodeURIComponent(JSON.stringify(stranger))}`} className="block rounded-lg hover:bg-secondary/50 transition-colors">
                                <div className="flex items-center justify-between gap-4 p-3">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={stranger.avatar} alt={stranger.username} />
                                            <AvatarFallback>{stranger.username.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-bold text-md">{stranger.username}</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline">
                                        <MessageSquareText className="mr-2 h-4 w-4" />
                                        Chat
                                    </Button>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-10">
                        <Star className="mx-auto h-12 w-12 mb-4" />
                        <h3 className="text-lg font-semibold">No Favorites Yet</h3>
                        <p>You can add users to your favorites from the chat screen.</p>
                        <Button asChild className="mt-4">
                            <Link href="/chat">Start Chatting</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
