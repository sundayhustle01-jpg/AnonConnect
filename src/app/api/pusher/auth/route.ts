
import { NextRequest, NextResponse } from 'next/server';
import Pusher from 'pusher';
import type { UserProfile } from '@/lib/types';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: NextRequest) {
  const data = await req.text();
  const params = new URLSearchParams(data);
  const socketId = params.get('socket_id')!;
  const channel = params.get('channel_name')!;
  
  // For presence channels, user_id and user_info are required.
  const userProfile: UserProfile = JSON.parse(params.get('user_profile') || '{}');

  if (!userProfile || !userProfile.id) {
      return NextResponse.json({ message: 'User profile is required for presence channels' }, { status: 403 });
  }

  const user = {
    id: userProfile.id, 
    user_info: userProfile,
  };

  try {
    const authResponse = pusher.authorizeChannel(socketId, channel, user);
    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json({ message: 'Pusher authorization failed' }, { status: 500 });
  }
}
