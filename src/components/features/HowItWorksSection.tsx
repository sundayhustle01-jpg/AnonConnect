'use client';

import { UserPlus, MessagesSquare, Heart } from 'lucide-react';

export function HowItWorksSection() {
  return (
    <section className="w-full py-20 md:py-32 bg-secondary/20">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Get Started in Seconds
        </h2>
        <div className="grid gap-12 md:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
              <UserPlus className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">1. Create Your Profile</h3>
            <p className="text-muted-foreground">
              Choose a username and an avatar to get started. No personal information required.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
              <MessagesSquare className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">2. Start a Chat</h3>
            <p className="text-muted-foreground">
              Click "Start Chatting" to be instantly connected with a random user from around the world.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
              <Heart className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">3. Connect & Share</h3>
            <p className="text-muted-foreground">
              Enjoy an anonymous conversation. If you like who you're talking to, add them to your favorites.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
