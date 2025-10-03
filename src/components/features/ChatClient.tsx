'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, Power, Send, Users } from 'lucide-react';

import type { Message, UserProfile, SearchFilters } from '@/lib/types';
import { sendMessage } from '@/app/actions';
import { useUser } from '@/hooks/use-user';
import { PlaceHolderImages } from '@/lib/placeholder-images';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '../ui/card';
import { allStrangers } from '@/lib/strangers';

function findStranger(filters: SearchFilters, currentUserId?: string): UserProfile | null {
    const availableStrangers = allStrangers.filter(s => s.id !== currentUserId);

    const filtered = availableStrangers.filter(stranger => {
        const ageMatch = filters.minAge && filters.maxAge && stranger.age
            ? stranger.age >= filters.minAge && stranger.age <= filters.maxAge
            : true;
        
        const genderMatch = filters.gender && filters.gender !== 'any'
            ? stranger.gender === filters.gender
            : true;

        const locationMatch = filters.location
            ? stranger.location?.toLowerCase().includes(filters.location.toLowerCase())
            : true;

        return ageMatch && genderMatch && locationMatch;
    });

    if (filtered.length > 0) {
        return filtered[Math.floor(Math.random() * filtered.length)];
    }

    if (availableStrangers.length > 0) {
        return availableStrangers[Math.floor(Math.random() * availableStrangers.length)];
    }

    return null;
}

function getRandomStranger(currentUserId?: string): UserProfile {
    const availableStrangers = allStrangers.filter(s => s.id !== currentUserId);
    const stranger = availableStrangers[Math.floor(Math.random() * availableStrangers.length)];
    return stranger || allStrangers[0];
}

export function ChatClient() {
  const { user, isLoaded, addStrangerToHistory } = useUser();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [stranger, setStranger] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const strangerParam = searchParams.get('stranger');
    const filtersParam = searchParams.get('filters');

    if (strangerParam) {
        try {
            const passedStranger: UserProfile = JSON.parse(strangerParam);
            setStranger(passedStranger);
            addStrangerToHistory(passedStranger);
        } catch (error) {
            console.error('Failed to parse stranger from URL, starting random chat.', error);
            startNewRandomChat();
        }
    } else if (filtersParam) {
        try {
            const filters: SearchFilters = JSON.parse(filtersParam);
            const newStranger = findStranger(filters, user?.id);
            if (newStranger) {
                setStranger(newStranger);
                addStrangerToHistory(newStranger);
                toast({
                    title: 'Found a match!',
                    description: `You have been connected with ${newStranger.username}.`,
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: 'No match found',
                    description: "We couldn't find anyone matching your criteria. Starting a random chat instead.",
                });
                startNewRandomChat();
            }
        } catch (error) {
             console.error('Failed to parse filters from URL, starting random chat.', error);
            startNewRandomChat();
        }
    } else {
        startNewRandomChat();
    }
  }, [searchParams, addStrangerToHistory, user?.id]);

  const startNewRandomChat = () => {
    const newStranger = getRandomStranger(user?.id);
    setStranger(newStranger);
    addStrangerToHistory(newStranger);
    return newStranger;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleNewChat = () => {
    setMessages([]);
    const newStranger = startNewRandomChat();
    toast({
        title: 'Finding new chat...',
        description: `You have been connected with ${newStranger.username}.`,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim() || !user || !stranger) return;
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

  if (!isLoaded || !user || !stranger) {
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
