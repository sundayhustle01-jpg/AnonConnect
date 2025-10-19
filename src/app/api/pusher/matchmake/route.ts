
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

export async function POST(req: NextRequest) {
  try {
    const currentUserProfile: UserProfile = await req.json();

    if (!currentUserProfile) {
        return NextResponse.json({ message: 'User profile is required' }, { status: 400 });
    }

    const members = await pusher.get({ path: `/channels/${WAITING_CHANNEL}/users` });
    const waitingUsers = (await members.json()).users as { id: string, user_info: UserProfile }[];

    const otherUser = waitingUsers.find(user => user.id !== currentUserProfile.id);

    if (otherUser) {
      const chatRoomId = [currentUserProfile.id, otherUser.id].sort().join('_');
      const privateChannelName = `private-${chatRoomId}`;

      // Notify both users that a match has been found
      await Promise.all([
        pusher.trigger(privateChannelName, 'match-found', { stranger: otherUser.user_info }),
        pusher.trigger(privateChannelName, 'match-found', { stranger: currentUserProfile }),
      ]);

      return NextResponse.json({ status: 'match-found' });
    } else {
      return NextResponse.json({ status: 'waiting' });
    }
  } catch (error) {
    console.error('Matchmaking error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
