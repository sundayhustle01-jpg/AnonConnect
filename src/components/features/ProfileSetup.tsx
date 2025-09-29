'use client';

import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { User, Users } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const userAvatars = PlaceHolderImages.filter(img => img.id.startsWith('avatar'));

const dummyUsers: Omit<UserProfile, 'id'>[] = [
  { username: 'AstroCat', avatar: userAvatars[0].imageUrl },
  { username: 'PixelPilot', avatar: userAvatars[1].imageUrl },
  { username: 'SynthWaveRider', avatar: userAvatars[2].imageUrl },
  { username: 'QuantumQuokka', avatar: userAvatars[3].imageUrl },
];

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters.').max(20, 'Username must be 20 characters or less.'),
  avatar: z.string().url('Please select an avatar.'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileSetup() {
  const { user, updateUser } = useUser();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      avatar: user?.avatar || (userAvatars.length > 0 ? userAvatars[0].imageUrl : ''),
    },
  });

  useEffect(() => {
    if (user?.username && user.avatar) {
      form.reset({
        username: user.username,
        avatar: user.avatar,
      });
    }
  }, [user, form]);

  function onSubmit(data: ProfileFormValues) {
    updateUser(data);
  }

  const handleDummyUserSelect = (username: string) => {
    const selectedUser = dummyUsers.find(u => u.username === username);
    if (selectedUser) {
      form.setValue('username', selectedUser.username);
      form.setValue('avatar', selectedUser.avatar);
    }
  };


  return (
    <Card className="w-full max-w-md animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <User /> Create Your Profile
        </CardTitle>
        <CardDescription>
          Choose a username and avatar, or pick a dummy account to get started.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
            <Label className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4" />
                Quick Start
            </Label>
            <Select onValueChange={handleDummyUserSelect}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a dummy account..." />
                </SelectTrigger>
                <SelectContent>
                    {dummyUsers.map((dummy) => (
                    <SelectItem key={dummy.username} value={dummy.username}>
                        <div className="flex items-center gap-3">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={dummy.avatar} alt={dummy.username} />
                            <AvatarFallback>{dummy.username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{dummy.username}</span>
                        </div>
                    </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or create your own</span>
            </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="CoolCat123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Choose your avatar</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-4 gap-4"
                    >
                      {userAvatars.map(avatar => (
                        <FormItem key={avatar.id} className="flex items-center justify-center">
                          <FormControl>
                            <RadioGroupItem value={avatar.imageUrl} className="sr-only" />
                          </FormControl>
                          <FormLabel
                            className={cn(
                              'cursor-pointer rounded-full border-2 p-1 transition-all',
                              field.value === avatar.imageUrl ? 'border-primary' : 'border-transparent hover:border-primary/50'
                            )}
                          >
                            <Image
                              src={avatar.imageUrl}
                              alt={avatar.description}
                              width={64}
                              height={64}
                              className="rounded-full"
                              data-ai-hint={avatar.imageHint}
                            />
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" size="lg">
              Save and Continue
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

    