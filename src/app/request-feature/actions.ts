'use server';

import * as z from 'zod';

const featureRequestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
});

export async function submitFeatureRequest(data: z.infer<typeof featureRequestSchema>) {
    try {
        const validatedData = featureRequestSchema.parse(data);
        console.log('Feature Request Submitted:');
        console.log('Title:', validatedData.title);
        console.log('Description:', validatedData.description);
        return { success: true };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors.map(e => e.message).join(', ') };
        }
        return { success: false, error: 'An unexpected error occurred.' };
    }
}
