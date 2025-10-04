
'use client';

import { useState, useEffect, useRef, useTransition, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, Paperclip, Power, Send, Users, X, Star } from 'lucide-react';
import Image from 'next/image';

import type { Message, UserProfile, SearchFilters } from '@/lib/types';
import { sendMessage, findStranger as findStrangerAction } from '@/app/actions';
import { useUser } from '@/hooks/use-user';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { allStrangers } from '@/lib/strangers';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { format } from 'date-fns';

const INACTIVITY_TIMEOUT = 2 * 60 * 1000; // 2 minutes

function getRandomStranger(currentUserId?: string): UserProfile {
    const availableStrangers = allStrangers.filter(s => s.id !== currentUserId && s.online);
    if(availableStrangers.length > 0){
        return availableStrangers[Math.floor(Math.random() * availableStrangers.length)];
    }
    const allAvailableStrangers = allStrangers.filter(s => s.id !== currentUserId);
    return allAvailableStrangers[Math.floor(Math.random() * allAvailableStrangers.length)] || allStrangers[0];
}

export function ChatClient() {
  const { user, isLoaded, addStrangerToHistory, addFavorite, removeFavorite, isFavorite } = useUser();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [stranger, setStranger] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [imageToSend, setImageToSend] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startNewRandomChat = useCallback(async () => {
    const newStranger = await findStrangerAction({}, user?.id);
    setStranger(newStranger.stranger);
    if (newStranger.stranger) {
      addStrangerToHistory(newStranger.stranger);
    }
    setMessages([]);
    setImageToSend(null);
    return newStranger.stranger;
  }, [user?.id, addStrangerToHistory]);

  const handleNewChat = useCallback(async () => {
    const newStranger = await startNewRandomChat();
    toast({
        title: 'Finding new chat...',
        description: `You have been connected with ${newStranger.username}.`,
    });
  }, [startNewRandomChat, toast]);
  
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      toast({
        variant: 'destructive',
        title: 'Disconnected',
        description: 'You were disconnected due to inactivity.',
      });
      handleNewChat();
    }, INACTIVITY_TIMEOUT);
  }, [handleNewChat, toast]);

  useEffect(() => {
    resetInactivityTimer();
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [resetInactivityTimer, messages]);

  useEffect(() => {
    const strangerParam = searchParams.get('stranger');
    const filtersParam = searchParams.get('filters');
    
    const initializeChat = async () => {
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
                const { stranger: newStranger, match } = await findStrangerAction(filters, user?.id);
                
                if (newStranger) {
                    setStranger(newStranger);
                    addStrangerToHistory(newStranger);
                    if (match) {
                        toast({
                            title: 'Found a match!',
                            description: `You have been connected with ${newStranger.username}.`,
                        });
                    } else {
                        toast({
                             variant: 'destructive',
                             title: 'No match found',
                             description: "We couldn't find anyone with your criteria. Connecting you with a random user.",
                        });
                    }
                } else {
                     startNewRandomChat();
                }

            } catch (error) {
                 console.error('Failed to parse filters from URL, starting random chat.', error);
                startNewRandomChat();
            }
        } else {
            startNewRandomChat();
        }
    }

    if(isLoaded){
        initializeChat();
    }
  }, [searchParams, addStrangerToHistory, user?.id, toast, startNewRandomChat, isLoaded]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToSend(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset file input value to allow selecting the same file again
    if(event.target) {
        event.target.value = '';
    }
  };

  const handleToggleFavorite = () => {
      if (!stranger) return;
      const isCurrentlyFavorite = isFavorite(stranger.id);
      if (isCurrentlyFavorite) {
          removeFavorite(stranger.id);
          toast({ title: `${stranger.username} removed from favorites.` });
      } else {
          addFavorite(stranger.id);
          toast({ title: `${stranger.username} added to favorites.` });
      }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((!inputValue.trim() && !imageToSend) || !user || !stranger) return;
    
    resetInactivityTimer();

    const optimisticInput = inputValue;
    const optimisticImage = imageToSend;
    setInputValue('');
    setImageToSend(null);

    startTransition(async () => {
      const result = await sendMessage(optimisticInput, user.avatar, stranger.avatar, optimisticImage ?? undefined);
      if ('error' in result) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
        setInputValue(optimisticInput);
        setImageToSend(optimisticImage);
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
  
  const isCurrentlyFavorite = isFavorite(stranger.id);

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
            <p className={cn("text-xs", stranger.online ? "text-primary" : "text-muted-foreground")}>{stranger.online ? 'Online' : 'Offline'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleToggleFavorite}>
                <Star className={cn("h-5 w-5", isCurrentlyFavorite ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />
            </Button>
            <Button variant="outline" size="sm" onClick={handleNewChat}>
                <Power className="mr-2 h-4 w-4 text-primary" />
                New Chat
            </Button>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-4xl space-y-6">
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
                        'flex w-full max-w-lg animate-message-in flex-col gap-1',
                        message.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                    )}
                >
                    <div className={cn('flex items-end gap-3', message.sender === 'user' && 'flex-row-reverse')}>
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={message.avatar} />
                            <AvatarFallback>{message.sender === 'user' ? user.username.charAt(0) : stranger.username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div
                            className={cn(
                                'rounded-2xl px-4 py-2 text-sm md:text-base shadow-md',
                                message.sender === 'user'
                                ? 'rounded-br-none bg-primary text-primary-foreground'
                                : 'rounded-bl-none bg-secondary text-secondary-foreground',
                                message.image && 'p-2'
                            )}
                        >
                            {message.image ? (
                              <Dialog>
                                <DialogTrigger>
                                  <Image 
                                    src={message.image} 
                                    alt="Sent image" 
                                    width={200} 
                                    height={200} 
                                    className="rounded-lg object-cover cursor-pointer"
                                  />
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl p-0">
                                   <Image 
                                    src={message.image} 
                                    alt="Sent image" 
                                    width={1000} 
                                    height={800} 
                                    className="w-full h-auto object-contain rounded-lg"
                                  />
                                </DialogContent>
                              </Dialog>
                            ) : null}
                            {message.text && <p className={cn(message.image && 'mt-2')}>{message.text}</p>}
                        </div>
                    </div>
                     <p className={cn(
                        "text-xs text-muted-foreground",
                        message.sender === 'user' ? "pr-11" : "pl-11"
                     )}>
                        {format(new Date(message.timestamp), 'p')}
                    </p>
                </div>
            ))}
             <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="shrink-0 border-t bg-background p-4">
        <div className="mx-auto max-w-4xl">
           {imageToSend && (
            <div className="relative mb-2 w-28 h-28">
              <Image src={imageToSend} alt="Preview" fill className="rounded-lg object-cover" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={() => setImageToSend(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/jpeg, image/gif"
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isPending}>
                <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                resetInactivityTimer();
              }}
              placeholder="Type a message..."
              autoComplete="off"
              className="h-11 text-base"
              disabled={isPending}
            />
            <Button type="submit" size="icon" className="h-11 w-11 shrink-0" disabled={isPending || (!inputValue.trim() && !imageToSend)}>
              {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
        </div>
      </footer>
    </div>
  );
}
