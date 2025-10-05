'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/features/AppHeader';
import { Users, Lock, Zap, BeakerIcon, UserPlus, MessagesSquare, Heart, Twitter, Facebook, Share2, Linkedin } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (navigator.share) {
      setCanShare(true);
    }
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'AnonConnect',
        text: 'Join me on AnonConnect for anonymous conversations!',
        url: window.location.href,
      })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 bg-gradient-to-b from-background to-secondary/20">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-4 animate-fade-in-up">
              Welcome to AnonConnect
            </h1>
            <p className="max-w-3xl mx-auto text-muted-foreground md:text-xl lg:text-2xl mb-8 animate-fade-in-up [animation-delay:0.2s]">
              Connect with new people, share your thoughts, and explore new ideas—all with the safety of anonymity.
            </p>
            <Link href="/chat-app" passHref>
              <Button size="lg" className="animate-fade-in-up [animation-delay:0.4s]">
                Start Chatting Now
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center text-center p-6 rounded-lg transition-transform hover:scale-105 hover:bg-secondary/50">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Connect Instantly</h3>
                <p className="text-muted-foreground">
                  No sign-ups, no profiles. Jump straight into a conversation with a random stranger from our global community.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg transition-transform hover:scale-105 hover:bg-secondary/50">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <Lock className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Completely Anonymous</h3>
                <p className="text-muted-foreground">
                  Your privacy is our priority. Chats are not stored, and your identity is always protected.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg transition-transform hover:scale-105 hover:bg-secondary/50">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <Zap className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Fast & Seamless</h3>
                <p className="text-muted-foreground">
                  Enjoy a smooth and responsive chat experience, designed to keep the conversation flowing without interruptions.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg transition-transform hover:scale-105 hover:bg-secondary/50">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <BeakerIcon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Cutting-Edge Features</h3>
                <p className="text-muted-foreground">
                  We use Firebase for A/B testing and staged rollouts, so you get to try our newest features first.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
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

        {/* FAQ Section */}
        <section className="w-full py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
              <AccordionItem value="item-1">
                <AccordionTrigger>Is AnonConnect really anonymous?</AccordionTrigger>
                <AccordionContent>
                  Yes, your privacy is our top priority. We do not require any personal information to sign up, and your conversations are not stored on our servers. You can chat with confidence, knowing your identity is protected.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Can I reconnect with someone I enjoyed talking to?</AccordionTrigger>
                <AccordionContent>
                  Absolutely! If you have a great conversation, you can add the user to your favorites. This allows you to start a new chat with them directly from your favorites list, as long as they are online.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>How are users matched?</AccordionTrigger>
                <AccordionContent>
                  Our system matches users randomly to encourage spontaneous connections. However, we also offer a filtered search option that allows you to find partners based on shared interests, creating more meaningful conversations.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Is there a mobile app available?</AccordionTrigger>
                <AccordionContent>
                  Currently, AnonConnect is available as a web application that is fully responsive and works seamlessly on all devices. A native mobile app is on our roadmap, so stay tuned for future updates!
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Share Section */}
        <section className="w-full py-20 md:py-32 bg-secondary/20">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Share the Fun!
            </h2>
            <p className="max-w-2xl mx-auto text-muted-foreground md:text-xl mb-8">
              Enjoying AnonConnect? Share it with your friends and let them join the conversation.
            </p>
            {canShare ? (
              <Button onClick={handleShare}>
                <Share2 className="mr-2 h-5 w-5" />
                Share
              </Button>
            ) : (
              <div className="flex justify-center gap-4 flex-wrap">
                <Button asChild variant="outline">
                  <a href="https://twitter.com/intent/tweet?text=Join%20me%20on%20AnonConnect%20for%20anonymous%20conversations!%20&url=https://your-app-url.com" target="_blank" rel="noopener noreferrer">
                    <Twitter className="mr-2 h-5 w-5" />
                    Twitter
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href="https://www.facebook.com/sharer/sharer.php?u=https://your-app-url.com" target="_blank" rel="noopener noreferrer">
                    <Facebook className="mr-2 h-5 w-5" />
                    Facebook
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href="https://api.whatsapp.com/send?text=Join%20me%20on%20AnonConnect%20for%20anonymous%20conversations!%20https://your-app-url.com" target="_blank" rel="noopener noreferrer">
                    <Share2 className="mr-2 h-5 w-5" />
                    WhatsApp
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href="https://www.linkedin.com/shareArticle?mini=true&url=https://your-app-url.com&title=Join%20me%20on%20AnonConnect!&summary=Join%20me%20on%20AnonConnect%20for%20anonymous%20conversations!" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="mr-2 h-5 w-5" />
                    LinkedIn
                  </a>
                </Button>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full py-6 bg-secondary/50">
        <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AnonConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
