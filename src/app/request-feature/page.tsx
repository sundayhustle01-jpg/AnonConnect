
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTransition } from 'react';
import { toast } from '@/hooks/use-toast';
import { submitFeatureRequest } from './actions';

const featureRequestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
});

type FeatureRequestFormValues = z.infer<typeof featureRequestSchema>;

export default function FeatureRequestPage() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<FeatureRequestFormValues>({
    resolver: zodResolver(featureRequestSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  function onSubmit(data: FeatureRequestFormValues) {
    startTransition(async () => {
        const result = await submitFeatureRequest(data);
        if (result.success) {
            toast({ title: 'Success', description: 'Your feature request has been submitted.' });
            form.reset();
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
    });
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader>
            <CardTitle>Request a Feature</CardTitle>
            <CardDescription>Have an idea for a new feature? Let us know!</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Add a dark mode" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="Describe your feature idea in detail..."
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" disabled={isPending}>Submit</Button>
            </form>
            </Form>
        </CardContent>
        </Card>
    </div>
  );
}
