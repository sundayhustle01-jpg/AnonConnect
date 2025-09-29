'use client';

import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters.').max(20, 'Username must be 20 characters or less.'),
  avatar: z.string().url('Please select an avatar.'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const userAvatars = PlaceHolderImages.filter(img => img.id.startsWith('avatar'));

export function ProfileSetup() {
  const { user, updateUser } = useUser();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      avatar: user?.avatar || userAvatars[0].imageUrl,
    },
  });

  function onSubmit(data: ProfileFormValues) {
    updateUser(data);
  }

  return (
    <Card className="w-full max-w-md animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <User /> Create Your Profile
        </CardTitle>
        <CardDescription>
          Choose a username and avatar to start chatting. This is just for fun and isn't saved anywhere permanently.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                      defaultValue={field.value}
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
