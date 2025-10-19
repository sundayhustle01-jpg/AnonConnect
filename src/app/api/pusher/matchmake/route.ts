
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

const WAITING_CHANNEL = 'presence-waiting-room';

// Function to create a unique, private channel name for notifications
const getPersonalChannelName = (userId: string) => `private-user-${userId}`;

export async function POST(req: NextRequest) {
  try {
    const currentUserProfile: UserProfile = await req.json();

    if (!currentUserProfile || !currentUserProfile.id) {
        return NextResponse.json({ message: 'User profile is required' }, { status: 400 });
    }

    const members = await pusher.get({ path: `/channels/${WAITING_CHANNEL}/users` });
    const waitingUsers = (await members.json()).users as { id: string, user_info: UserProfile }[];

    // Find another user who is not the current user
    const otherUser = waitingUsers.find(user => user.id !== currentUserProfile.id);

    if (otherUser) {
      // A match is found
      const chatRoomId = [currentUserProfile.id, otherUser.id].sort().join('_');
      
      // Instead of triggering on the new room, trigger on each user's personal channel
      await Promise.all([
        pusher.trigger(getPersonalChannelName(currentUserProfile.id), 'match-found', { 
            stranger: otherUser.user_info,
            chatRoomId: chatRoomId 
        }),
        pusher.trigger(getPersonalChannelName(otherUser.id), 'match-found', { 
            stranger: currentUserProfile,
            chatRoomId: chatRoomId
        }),
      ]);

      return NextResponse.json({ status: 'match-found' });
    } else {
      // No other user is available, so the current user is just waiting.
      return NextResponse.json({ status: 'waiting' });
    }
  } catch (error) {
    console.error('Matchmaking error:', error);
    // It's helpful to log the specific error to the console
    if (error instanceof Error) {
        console.error(error.message);
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
