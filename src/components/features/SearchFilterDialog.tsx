'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

const filterSchema = z.object({
  ageRange: z.array(z.number()).min(2).max(2),
  gender: z.enum(['any', 'male', 'female', 'other']),
  location: z.string().optional(),
});

type FilterFormValues = z.infer<typeof filterSchema>;

export function SearchFilterDialog({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      ageRange: [18, 60],
      gender: 'any',
      location: '',
    },
  });

  const onSubmit = (data: FilterFormValues) => {
    const filters = {
      minAge: data.ageRange[0],
      maxAge: data.ageRange[1],
      gender: data.gender,
      location: data.location,
    };
    
    router.push(`/chat?filters=${encodeURIComponent(JSON.stringify(filters))}`);
  };
  
  const ageRange = form.watch('ageRange');

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Your Preferences</DialogTitle>
          <DialogDescription>
            Find someone to chat with based on your criteria.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="ageRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age Range: {ageRange[0]} - {ageRange[1]}</FormLabel>
                  <FormControl>
                    <Slider
                      aria-label="Age range slider"
                      min={13}
                      max={100}
                      step={1}
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger aria-label="Select gender">
                        <SelectValue placeholder="Select a gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. New York, USA" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
             <DialogClose asChild>
                <Button type="submit" className="w-full">
                  <Search className="mr-2 h-4 w-4" />
                  Find a Match
                </Button>
             </DialogClose>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
