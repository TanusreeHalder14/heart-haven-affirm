import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ChatMessage } from '@/types';
import { Bot, Send, Heart, Loader2 } from 'lucide-react';

export const HeartBotChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const suggestedPrompts = [
    "I'm feeling overwhelmed",
    "I need something positive to read",
    "Help me relax",
    "I'm having a difficult day",
    "Can you guide me through breathing?",
    "I need motivation"
  ];

  const botResponses = {
    "overwhelmed": [
      "I hear you, and it's completely okay to feel overwhelmed. Let's take this one breath at a time. Try the 4-7-8 breathing technique: breathe in for 4, hold for 7, exhale for 8. 🌸",
      "When everything feels too much, remember that you don't have to carry it all at once. What's one small thing you can focus on right now? 💙",
      "Feeling overwhelmed is your mind's way of saying you need a pause. Can you give yourself permission to rest for just 5 minutes? 🕊️"
    ],
    "positive": [
      "Here's something beautiful for you: You are braver than you believe, stronger than you seem, and more loved than you know. ✨",
      "Every day you choose to keep going is an act of courage. Today, you're here, you're trying, and that's everything. 🌟",
      "You have survived 100% of your difficult days so far. That's an incredible track record. 💖"
    ],
    "relax": [
      "Let's create a peaceful moment together. Close your eyes and imagine you're in your favorite calm place. What do you see, hear, and feel there? 🌺",
      "Try this: Place one hand on your chest and one on your belly. Breathe slowly and feel your body naturally calming down. You're safe. 🌊",
      "Relaxation is a gift you give yourself. Let your shoulders drop, soften your jaw, and know that this moment is yours. 🕯️"
    ],
    "difficult": [
      "Difficult days don't last, but resilient people like you do. You're going through something hard, and that takes strength. 🌱",
      "It's okay to not be okay today. Your feelings are valid, and you don't have to pretend otherwise. Tomorrow is a new day. 🌙",
      "Even in the hardest moments, you're growing. This difficult time is teaching you something about your own strength. 💪"
    ],
    "breathing": [
      "Let's breathe together. Inhale slowly for 4 counts... 1, 2, 3, 4. Hold for 4... 1, 2, 3, 4. Exhale for 6... 1, 2, 3, 4, 5, 6. Feel better? 🌸",
      "Here's a gentle breathing exercise: Breathe in peace, breathe out tension. Breathe in love, breathe out worry. You're doing great. 💙",
      "Place your hand on your heart. Feel it beating - that's your life force, steady and strong. Match your breathing to that gentle rhythm. ❤️"
    ],
    "motivation": [
      "You don't need to be perfect, you just need to be you. And you are enough, exactly as you are, right now. 🌟",
      "Every small step forward is progress. You don't have to leap mountains - just take the next gentle step. 🦋",
      "Believe in yourself like I believe in you. You have everything within you to handle whatever comes your way. ✨"
    ],
    "default": [
      "Thank you for sharing with me. I'm here to listen and support you. What's on your heart today? 💙",
      "Your feelings matter, and so do you. I'm here to walk alongside you in this moment. How can I help? 🌸",
      "Sometimes we just need someone to remind us that we're not alone. You're not alone - I'm here with you. 💖"
    ]
  };

  useEffect(() => {
    // Welcome message
    const welcomeMessage: ChatMessage = {
      id: '1',
      content: "Hello, beautiful soul! 💖 I'm HeartBot, your emotional support companion. I'm here to listen, comfort, and guide you through whatever you're feeling. What's on your heart today?",
      isBot: true,
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('overwhelm') || message.includes('stress') || message.includes('too much')) {
      return botResponses.overwhelmed[Math.floor(Math.random() * botResponses.overwhelmed.length)];
    }
    if (message.includes('positive') || message.includes('good') || message.includes('happy')) {
      return botResponses.positive[Math.floor(Math.random() * botResponses.positive.length)];
    }
    if (message.includes('relax') || message.includes('calm') || message.includes('peace')) {
      return botResponses.relax[Math.floor(Math.random() * botResponses.relax.length)];
    }
    if (message.includes('difficult') || message.includes('hard') || message.includes('tough') || message.includes('bad day')) {
      return botResponses.difficult[Math.floor(Math.random() * botResponses.difficult.length)];
    }
    if (message.includes('breath') || message.includes('breathing')) {
      return botResponses.breathing[Math.floor(Math.random() * botResponses.breathing.length)];
    }
    if (message.includes('motivat') || message.includes('inspire') || message.includes('encourage')) {
      return botResponses.motivation[Math.floor(Math.random() * botResponses.motivation.length)];
    }
    
    return botResponses.default[Math.floor(Math.random() * botResponses.default.length)];
  };

  const handleSend = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: text,
      isBot: false,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Add bot response
    const botMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: getResponse(text),
      isBot: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-8 space-y-8 fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-gradient-primary">
            <Bot className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-glow">HeartBot</h1>
        <p className="text-xl text-muted-foreground">
          Your AI emotional support companion
        </p>
      </div>

      {/* Suggested Prompts */}
      <Card className="card-gentle">
        <h3 className="text-lg font-semibold mb-4">Try asking me about:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {suggestedPrompts.map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => handleSend(prompt)}
              className="text-left justify-start h-auto p-3 rounded-2xl border-border/50 hover:bg-primary/10 hover:border-primary/30"
            >
              {prompt}
            </Button>
          ))}
        </div>
      </Card>

      {/* Chat Area */}
      <Card className="card-floating">
        <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gradient-hero rounded-2xl">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.isBot
                    ? 'bg-card border border-border shadow-soft'
                    : 'bg-gradient-primary text-white shadow-medium'
                }`}
              >
                {message.isBot && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Bot className="w-4 h-4" />
                    <span className="text-sm font-medium">HeartBot</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-card border border-border shadow-soft max-w-xs px-4 py-3 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4" />
                  <span className="text-sm font-medium">HeartBot</span>
                </div>
                <div className="flex items-center space-x-1 mt-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your heart..."
              className="flex-1 rounded-2xl border-border/50 focus:ring-primary focus:border-primary"
              disabled={isTyping}
            />
            <Button
              onClick={() => handleSend()}
              disabled={isTyping || !input.trim()}
              className="btn-healing px-6"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};