'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Bot, Send, X, Loader, Sparkles, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser } from '@/firebase';
import { chat } from '@/ai/flows/chatbot-flow';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

// Define the Message type directly in the component
type Message = {
  role: 'user' | 'model';
  content: string;
};

// Define the input type for the `chat` server action
type ChatInput = {
    userId?: string;
    history: Message[];
    prompt: string;
}

export function Chatbot() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        // A workaround to scroll to bottom.
        setTimeout(() => {
            const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }, 100);
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const currentInput = input;
    setMessages((prev) => [...prev, { role: 'user', content: currentInput }]);
    setInput('');

    startTransition(async () => {
      try {
        const chatInput: ChatInput = {
          userId: user?.uid,
          history: messages, // Send history BEFORE the new user message
          prompt: currentInput,
        }
        const response = await chat(chatInput);
        setMessages((prev) => [...prev, { role: 'model', content: response }]);
      } catch (error) {
        console.error('Chatbot error:', error);
        setMessages((prev) => [
          ...prev,
          { role: 'model', content: 'Sorry, something went wrong. Please try again.' },
        ]);
      }
    });
  };

  return (
    <>
      <div className={cn("fixed bottom-4 left-4 z-50 transition-all duration-300", 
        isOpen ? "w-[380px] h-[500px]" : "w-16 h-16"
      )}>
        {isOpen ? (
          <Card className="h-full flex flex-col shadow-2xl animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">CivixBot</CardTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full" ref={scrollAreaRef}>
                    <div className="p-4 space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-muted-foreground p-8">
                                {user ? (
                                    <p>Hi! I'm CivixBot. Ask me about the status of your reported issues.</p>
                                ) : (
                                    <p>Hi! I'm CivixBot. Ask me anything about the Civix platform.</p>
                                )}
                            </div>
                        )}
                        {messages.map((message, index) => (
                        <div
                            key={index}
                            className={cn(
                            'flex gap-3 text-sm',
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                            )}
                        >
                            {message.role === 'model' && (
                                <Avatar className="w-8 h-8 border">
                                    <div className="flex items-center justify-center h-full w-full bg-primary/10">
                                        <Sparkles className="w-5 h-5 text-primary"/>
                                    </div>
                                </Avatar>
                            )}
                            <div
                                className={cn(
                                'rounded-lg px-3 py-2 max-w-[80%]',
                                message.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                )}
                            >
                                <p className="whitespace-pre-wrap">{message.content}</p>
                            </div>
                            {message.role === 'user' && (
                                <Avatar className="w-8 h-8">
                                    {user ? (
                                        <>
                                            <AvatarImage src={user.photoURL ?? ''} />
                                            <AvatarFallback>{user?.displayName?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase()}</AvatarFallback>
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-center h-full w-full bg-muted">
                                            <UserIcon className="w-5 h-5 text-muted-foreground"/>
                                        </div>
                                    )}
                                </Avatar>
                            )}
                        </div>
                        ))}
                        {isPending && (
                            <div className="flex justify-start gap-3 text-sm">
                                <Avatar className="w-8 h-8 border">
                                    <div className="flex items-center justify-center h-full w-full bg-primary/10">
                                        <Sparkles className="w-5 h-5 text-primary"/>
                                    </div>
                                </Avatar>
                                <div className="bg-muted rounded-lg px-3 py-2 flex items-center">
                                    <Loader className="h-5 w-5 animate-spin" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
            <div className="p-4 border-t">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={user ? "Ask about your issues..." : "Ask about Civix..."}
                  disabled={isPending}
                />
                <Button type="submit" size="icon" disabled={isPending || !input.trim()}>
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </Card>
        ) : (
          <Button
            className="w-16 h-16 rounded-full shadow-2xl"
            onClick={() => setIsOpen(true)}
          >
            <Sparkles className="h-8 w-8" />
          </Button>
        )}
      </div>
    </>
  );
}
