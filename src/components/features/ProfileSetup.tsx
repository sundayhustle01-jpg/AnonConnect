'use client';

import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { User, Users, Upload } from 'lucide-react';
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
  { username: 'AstroCat', avatar: userAvatars[0].imageUrl, age: 25, gender: 'male', location: 'USA' },
  { username: 'PixelPilot', avatar: userAvatars[1].imageUrl, age: 30, gender: 'female', location: 'Canada' },
  { username: 'SynthWaveRider', avatar: userAvatars[2].imageUrl, age: 22, gender: 'other', location: 'UK' },
  { username: 'QuantumQuokka', avatar: userAvatars[3].imageUrl, age: 28, gender: 'prefer-not-to-say', location: 'Australia' },
];

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters.').max(20, 'Username must be 20 characters or less.'),
  avatar: z.string().url('Please select an avatar.'),
  age: z.coerce.number().min(13, 'You must be at least 13 years old.').max(120, 'Age seems unlikely.').optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
  location: z.string().max(50, 'Location can be up to 50 characters.').optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileSetup({ children }: { children: React.ReactNode }) {
  const { user, updateUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: '',
      avatar: userAvatars.length > 0 ? userAvatars[0].imageUrl : '',
      age: '',
      gender: 'prefer-not-to-say',
      location: '',
    },
  });

  useEffect(() => {
    if (user) {
      setIsEditing(!!user.username);
      if (user.avatar && !userAvatars.some(a => a.imageUrl === user.avatar)) {
        setCustomAvatar(user.avatar);
      }
      form.reset({
        username: user.username || '',
        avatar: user.avatar || (userAvatars.length > 0 ? userAvatars[0].imageUrl : ''),
        age: user.age || '',
        gender: user.gender || 'prefer-not-to-say',
        location: user.location || '',
      });
    }
  }, [user, form]);

  function onSubmit(data: ProfileFormValues) {
    const wasEditing = isEditing;
    const profileData: Partial<UserProfile> = {
      ...data,
      age: data.age ? Number(data.age) : undefined,
    };
    updateUser(profileData);

    if (!wasEditing) {
      router.push('/chat');
    }
  }

  const handleDummyUserSelect = (username: string) => {
    const selectedUser = dummyUsers.find(u => u.username === username);
    if (selectedUser) {
      form.reset(selectedUser);
      setCustomAvatar(null);
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setCustomAvatar(dataUrl);
        form.setValue('avatar', dataUrl, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className={cn("w-full max-w-md", !isEditing && "animate-fade-in-up")}>
      {!isEditing && (
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <User /> Create Your Profile
            </CardTitle>
            <CardDescription>
              Choose a username and avatar, or pick a dummy account to get started.
            </CardDescription>
        </CardHeader>
      )}
      <CardContent className={cn(isEditing && "pt-6")}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!isEditing && (
                <>
                <div>
                    <FormLabel className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4" />
                        Quick Start
                    </FormLabel>
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
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or create your own</span>
                    </div>
                </div>
                </>
            )}
            
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Choose your avatar</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (userAvatars.some(a => a.imageUrl === value)) {
                          setCustomAvatar(null);
                        }
                      }}
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
                      {customAvatar && (
                        <FormItem className="flex items-center justify-center">
                          <FormControl>
                            <RadioGroupItem value={customAvatar} className="sr-only" />
                          </FormControl>
                          <FormLabel
                            className={cn(
                              'cursor-pointer rounded-full border-2 p-1 transition-all',
                              field.value === customAvatar ? 'border-primary' : 'border-transparent hover:border-primary/50'
                            )}
                          >
                            <Image
                              src={customAvatar}
                              alt="Custom avatar"
                              width={64}
                              height={64}
                              className="rounded-full object-cover"
                            />
                          </FormLabel>
                        </FormItem>
                      )}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Photo
            </Button>
            <Input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/png, image/jpeg, image/gif"
            />
            
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
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 25" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. New York, USA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {children}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
