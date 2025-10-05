
'use client';

import { useState, useEffect, useRef, useTransition, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, Paperclip, Power, Send, Users, X, Star, MoreVertical, Shield, Flag, TrendingUp, Cake } from 'lucide-react';
import Image from 'next/image';

import type { Message, UserProfile, SearchFilters } from '@/lib/types';
import { sendMessage, findStranger as findStrangerAction, blockUser, reportUser, handleChatEnd } from '@/app/actions';
import { useUser } from '@/hooks/use-user';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

const INACTIVITY_TIMEOUT = 2 * 60 * 1000; // 2 minutes

type ChatClientProps = {
    initialStranger: UserProfile;
    initialFilters: string | null;
}

export function ChatClient({ initialStranger, initialFilters }: ChatClientProps) {
  const { user, isLoaded, addStrangerToHistory, addFavorite, removeFavorite, isFavorite } = useUser();
  const { toast } = useToast();
  const [stranger, setStranger] = useState<UserProfile | null>(initialStranger);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [imageToSend, setImageToSend] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [chatStartTime, setChatStartTime] = useState<number>(Date.now());

  const endChatSession = useCallback(() => {
    if (user && stranger) {
        const durationInSeconds = (Date.now() - chatStartTime) / 1000;
        handleChatEnd(user.id, stranger.id, durationInSeconds);
    }
  }, [user, stranger, chatStartTime]);

  const startNewRandomChat = useCallback(async () => {
    endChatSession();
    const { stranger: newStranger } = await findStrangerAction({}, user?.id);
    setStranger(newStranger);
    if (newStranger) {
      addStrangerToHistory(newStranger);
    }
    setMessages([]);
    setImageToSend(null);
    setChatStartTime(Date.now());
    return newStranger;
  }, [user?.id, addStrangerToHistory, endChatSession]);

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
    if(isLoaded && initialStranger) {
      setStranger(initialStranger);
      addStrangerToHistory(initialStranger);
      setChatStartTime(Date.now());

      if (initialFilters) {
        const filters: SearchFilters = JSON.parse(initialFilters);
        findStrangerAction(filters, user?.id).then(({ match }) => {
            if (match) {
                toast({
                    title: 'Found a match!',
                    description: `You have been connected with ${initialStranger.username}.`,
                });
            } else {
                toast({
                     variant: 'destructive',
                     title: 'No match found',
                     description: "We couldn't find anyone with your criteria. Connecting you with a random user.",
                });
            }
        });
      }
    }
  }, [initialStranger, initialFilters, addStrangerToHistory, user?.id, toast, isLoaded]);

  useEffect(() => {
      return () => {
          endChatSession();
      };
  }, [endChatSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToSend(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
  
  const handleBlockUser = async () => {
      if (!user || !stranger) return;
      endChatSession();
      await blockUser(user.id, stranger.id);
      toast({ title: `${stranger.username} has been blocked. You will not be matched again.` });
      handleNewChat();
  };

  const handleReportUser = async () => {
      if (!user || !stranger) return;
      endChatSession();
      await reportUser(user.id, stranger.id);
      toast({ title: `${stranger.username} has been reported.` });
      handleNewChat();
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
        setIsTyping(true);
        setTimeout(() => {
            setMessages(prev => [...prev, result.strangerMessage]);
            setIsTyping(false);
        }, 1000 + Math.random() * 1000); // Simulate typing delay
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
          <Button variant="ghost" size="icon" asChild aria-label="Back to home">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer">
                <Avatar>
                  <AvatarImage src={stranger.avatar} alt={stranger.username} />
                  <AvatarFallback>{stranger.username.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold">{stranger.username}</p>
                  <p className={cn("text-xs", stranger.online ? "text-primary" : "text-muted-foreground")}>{stranger.online ? 'Online' : 'Offline'}</p>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent>
                <Card className="border-none">
                    <CardHeader className="items-center text-center">
                        <Avatar className="h-24 w-24 mb-4">
                            <AvatarImage src={stranger.avatar} alt={stranger.username} />
                            <AvatarFallback>{stranger.username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-2xl">{stranger.username}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-muted">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                <span className="font-semibold">Karma</span>
                            </div>
                            <span className="font-bold text-lg text-primary">{stranger.karma ?? 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-muted">
                             <div className="flex items-center gap-2">
                                <Cake className="h-5 w-5 text-muted-foreground" />
                                <span className="font-semibold">Age</span>
                            </div>
                            <span>{stranger.age ?? 'N/A'}</span>
                        </div>
                         <div className="flex items-center justify-between p-2 rounded-lg bg-muted">
                             <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                <span className="font-semibold">Gender</span>
                            </div>
                            <span className="capitalize">{stranger.gender ?? 'N/A'}</span>
                        </div>
                    </CardContent>
                </Card>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleToggleFavorite} aria-label={isCurrentlyFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                <Star className={cn("h-5 w-5", isCurrentlyFavorite ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />
            </Button>
            <Button variant="outline" size="sm" onClick={handleNewChat} aria-label="Start new chat">
                <Power className="mr-2 h-4 w-4 text-primary" />
                New Chat
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleBlockUser}>
                        <Shield className="mr-2 h-4 w-4" />
                        Block
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleReportUser}>
                        <Flag className="mr-2 h-4 w-4" />
                        Report
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
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
            {isTyping && <TypingIndicator avatar={stranger.avatar} />}
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
                aria-label="Remove image"
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
            <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isPending} aria-label="Attach image">
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
            <Button type="submit" size="icon" className="h-11 w-11 shrink-0" disabled={isPending || (!inputValue.trim() && !imageToSend)} aria-label="Send message">
              {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
        </div>
      </footer>
    </div>
  );
}

function TypingIndicator({ avatar }: { avatar: string }) {
    return (
        <div className={cn('flex w-full max-w-lg animate-message-in flex-col gap-1 mr-auto items-start')}>
            <div className={cn('flex items-end gap-3')}>
                <Avatar className="h-8 w-8">
                    <AvatarImage src={avatar} />
                    <AvatarFallback />
                </Avatar>
                <div className={cn('rounded-2xl px-4 py-2 text-sm md:text-base shadow-md rounded-bl-none bg-secondary text-secondary-foreground')}>
                    <div className="flex items-center justify-center gap-1.5 h-6">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" />
                    </div>
                </div>
            </div>
        </div>
    );
}
