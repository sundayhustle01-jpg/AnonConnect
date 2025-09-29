'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Power, Send, Users } from 'lucide-react';

import type { Message, UserProfile } from '@/lib/types';
import { sendMessage } from '@/app/actions';
import { useUser } from '@/hooks/use-user';
import { PlaceHolderImages } from '@/lib/placeholder-images';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '../ui/card';

const strangerAvatars = PlaceHolderImages.filter(p => p.id.startsWith('stranger'));
const strangerUsernames = ['ShadowFigment', 'SilentEcho', 'GlitchCat', 'PixelJester', 'DreamWeaver'];

function getRandomStranger(): UserProfile {
    return {
        id: crypto.randomUUID(),
        username: strangerUsernames[Math.floor(Math.random() * strangerUsernames.length)],
        avatar: strangerAvatars[Math.floor(Math.random() * strangerAvatars.length)].imageUrl,
    };
}

export function ChatClient() {
  const { user, isLoaded, updateLastStranger } = useUser();
  const { toast } = useToast();
  const [stranger, setStranger] = useState<UserProfile>({ id: '', username: '', avatar: '' });
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newStranger = getRandomStranger();
    setStranger(newStranger);
    updateLastStranger(newStranger);
  }, [updateLastStranger]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleNewChat = () => {
    setMessages([]);
    const newStranger = getRandomStranger();
    setStranger(newStranger);
    updateLastStranger(newStranger);
    toast({
        title: 'Finding new chat...',
        description: 'You have been connected with a new stranger.',
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim() || !user) return;
    const optimisticInput = inputValue;
    setInputValue('');

    startTransition(async () => {
      const result = await sendMessage(optimisticInput, user.avatar, stranger.avatar);
      if ('error' in result) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
        setInputValue(optimisticInput);
      } else {
        setMessages(prev => [...prev, result.userMessage]);
        setTimeout(() => {
             setMessages(prev => [...prev, result.strangerMessage]);
        }, 500);
      }
    });
  };

  if (!isLoaded || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex shrink-0 items-center justify-between border-b bg-background/80 p-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <Avatar>
            <AvatarImage src={stranger.avatar} alt={stranger.username} />
            <AvatarFallback>{stranger.username.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold">{stranger.username}</p>
            <p className="text-xs text-primary">Online</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleNewChat}>
            <Power className="mr-2 h-4 w-4 text-primary" />
            New Chat
        </Button>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-4xl space-y-6" ref={messagesEndRef}>
            {messages.length === 0 && (
                 <div className="flex flex-col items-center justify-center text-center text-muted-foreground pt-16 animate-fade-in">
                    <Users className="h-12 w-12 mb-4 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">You are now chatting with {stranger.username}</h2>
                    <p>Say hello! Messages are not stored and chats are anonymous.</p>
                </div>
            )}
            {messages.map((message) => (
                <div
                    key={message.id}
                    className={cn(
                        'flex items-end gap-3 w-full max-w-lg animate-message-in',
                        message.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                    )}
                >
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={message.avatar} />
                        <AvatarFallback>{message.sender === 'user' ? user.username.charAt(0) : stranger.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div
                        className={cn(
                            'rounded-2xl px-4 py-2 text-sm md:text-base shadow-md',
                            message.sender === 'user'
                            ? 'rounded-br-none bg-primary text-primary-foreground'
                            : 'rounded-bl-none bg-secondary text-secondary-foreground'
                        )}
                    >
                        <p>{message.text}</p>
                    </div>
                </div>
            ))}
        </div>
      </main>

      <footer className="shrink-0 border-t bg-background p-4">
        <div className="mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              autoComplete="off"
              className="h-11 text-base"
              disabled={isPending}
            />
            <Button type="submit" size="icon" className="h-11 w-11 shrink-0" disabled={isPending || !inputValue.trim()}>
              {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
        </div>
      </footer>
    </div>
  );
}
