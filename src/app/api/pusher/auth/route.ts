
import { NextRequest, NextResponse } from 'next/server';
import Pusher from 'pusher';
import type { UserProfile } from '@/lib/types';

// Basic check to see if the environment variables are loaded.
if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_KEY || !process.env.PUSHER_SECRET || !process.env.PUSHER_CLUSTER) {
    console.error('CRITICAL: Pusher environment variables are not set!');
}

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

console.log('Pusher auth endpoint initialized.');
console.log(`Pusher App ID: ${process.env.PUSHER_APP_ID ? 'Loaded' : 'MISSING'}`)
console.log(`Pusher Key: ${process.env.PUSHER_KEY ? 'Loaded' : 'MISSING'}`)
console.log(`Pusher Secret: ${process.env.PUSHER_SECRET ? 'Loaded' : 'MISSING'}`)
console.log(`Pusher Cluster: ${process.env.PUSHER_CLUSTER ? 'Loaded' : 'MISSING'}`)


export async function POST(req: NextRequest) {
  try {
    const data = await req.text();
    const params = new URLSearchParams(data);
    const socketId = params.get('socket_id');
    const channel = params.get('channel_name');
    
    if (!socketId || !channel) {
      return NextResponse.json({ message: 'Missing socket_id or channel_name' }, { status: 400 });
    }

    const userProfileString = params.get('user_profile');
    if (!userProfileString) {
        return NextResponse.json({ message: 'user_profile is required' }, { status: 403 });
    }

    const userProfile: UserProfile = JSON.parse(userProfileString);

    if (!userProfile || !userProfile.id) {
        return NextResponse.json({ message: 'Valid user_profile with ID is required' }, { status: 403 });
    }

    const user = {
      id: userProfile.id,
      user_info: userProfile,
    };

    console.log(`Authorizing user ${user.id} for channel ${channel}`);

    const authResponse = pusher.authorizeChannel(socketId, channel, user);
    return NextResponse.json(authResponse);

  } catch (error) {
    console.error('-----------------------------------');
    console.error('Pusher Authentication Error:', error);
    if (error instanceof Error) {
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
    }
    console.error('-----------------------------------');
    return NextResponse.json({ message: 'Internal Server Error during Pusher auth.' }, { status: 500 });
  }
}
