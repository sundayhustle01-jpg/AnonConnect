
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/features/AppHeader';
import { Users, Lock, Zap } from 'lucide-react';

export default function LandingPage() {
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
            <Link href="/" passHref>
              <Button size="lg" className="animate-fade-in-up [animation-delay:0.4s]">
                Start Chatting Now
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-12 md:grid-cols-3">
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
            </div>
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
