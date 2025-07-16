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
      "Feeling overwhelmed is your mind's way of saying you need a pause. Can you give yourself permission to rest for just 5 minutes? 🕊️",
      "I understand that weight you're carrying. Sometimes breaking tasks into tiny, manageable pieces helps. What's the smallest step you could take right now? 🌱",
      "Your feelings are completely valid. When overwhelmed, try the 'box breathing' - 4 counts in, hold 4, out 4, hold 4. This can help reset your nervous system. 🧘‍♀️"
    ],
    "positive": [
      "Here's something beautiful for you: You are braver than you believe, stronger than you seem, and more loved than you know. ✨",
      "Every day you choose to keep going is an act of courage. Today, you're here, you're trying, and that's everything. 🌟",
      "You have survived 100% of your difficult days so far. That's an incredible track record. 💖",
      "You are a unique combination of stardust and stories, dreams and determination. There's never been anyone quite like you. 🌌",
      "Your presence in this world creates ripples of kindness and light, even when you can't see them. You matter deeply. 🌸"
    ],
    "relax": [
      "Let's create a peaceful moment together. Close your eyes and imagine you're in your favorite calm place. What do you see, hear, and feel there? 🌺",
      "Try this: Place one hand on your chest and one on your belly. Breathe slowly and feel your body naturally calming down. You're safe. 🌊",
      "Relaxation is a gift you give yourself. Let your shoulders drop, soften your jaw, and know that this moment is yours. 🕯️",
      "Imagine tension melting away like warm honey from your shoulders, down your arms, and out through your fingertips. 🍯",
      "Picture yourself as a leaf floating gently on a calm lake. Notice how effortlessly you can just... be. 🍃"
    ],
    "difficult": [
      "Difficult days don't last, but resilient people like you do. You're going through something hard, and that takes strength. 🌱",
      "It's okay to not be okay today. Your feelings are valid, and you don't have to pretend otherwise. Tomorrow is a new day. 🌙",
      "Even in the hardest moments, you're growing. This difficult time is teaching you something about your own strength. 💪",
      "You're weathering a storm, and storms always pass. You don't have to dance in it - just survive it, and you're doing that beautifully. ⛈️",
      "Hard times often carry hidden gifts - resilience, empathy, wisdom. You're collecting strength you didn't know you had. 💎"
    ],
    "breathing": [
      "Let's breathe together. Inhale slowly for 4 counts... 1, 2, 3, 4. Hold for 4... 1, 2, 3, 4. Exhale for 6... 1, 2, 3, 4, 5, 6. Feel better? 🌸",
      "Here's a gentle breathing exercise: Breathe in peace, breathe out tension. Breathe in love, breathe out worry. You're doing great. 💙",
      "Place your hand on your heart. Feel it beating - that's your life force, steady and strong. Match your breathing to that gentle rhythm. ❤️",
      "Try 'belly breathing' - breathe so deep that only your belly rises, not your chest. This activates your body's natural calm response. 🫁",
      "Breathe in for 4, hold for 7, out for 8. This ancient technique helps switch your nervous system into rest mode. 🧘‍♀️"
    ],
    "motivation": [
      "You don't need to be perfect, you just need to be you. And you are enough, exactly as you are, right now. 🌟",
      "Every small step forward is progress. You don't have to leap mountains - just take the next gentle step. 🦋",
      "Believe in yourself like I believe in you. You have everything within you to handle whatever comes your way. ✨",
      "Your potential is like a seed - it might be dormant now, but with patience and self-compassion, amazing things will grow. 🌱",
      "You've overcome challenges before that once seemed impossible. Remember that strength - it's still there, ready when you need it. 🦅"
    ],
    "anxiety": [
      "Anxiety is your mind trying to protect you, but sometimes it gets a bit overprotective. Let's ground you: name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste. 👁️",
      "When anxiety spirals, remember: this feeling is temporary, you are safe right now, and you have survived anxious moments before. 🌊",
      "Try the 'STOP' technique: Stop what you're doing, Take a breath, Observe your thoughts and feelings, Proceed with kindness to yourself. 🛑",
      "Anxiety often whispers 'what if' scenarios. Try asking back: 'What if things go well? What if I can handle this?' Balance the narrative. ⚖️"
    ],
    "lonely": [
      "Loneliness is a universal human experience - you're not alone in feeling alone. Even in isolation, you're connected to countless others who understand. 🤝",
      "Sometimes we feel lonely in a crowd, and sometimes we feel connected while alone. Your worth doesn't depend on who's around you. 💝",
      "You are never truly alone when you have yourself. How can you be a kind friend to yourself today? 🌻",
      "Loneliness often signals our need for connection. Consider reaching out - even a small text to someone can bridge that gap. 📱"
    ],
    "sleep": [
      "Good sleep is like a warm hug for your brain. Try a 'worry journal' - write down your concerns before bed to put them away for the night. 📝",
      "Create a bedtime ritual: dim lights, no screens, maybe some gentle stretching or reading. Your body loves predictable signals. 🌙",
      "If your mind races at bedtime, try the '4-7-8' breathing or imagine yourself in a peaceful place in vivid detail. 😴",
      "Remember, rest is productive. You're not being lazy - you're recharging so you can be your best self tomorrow. 🔋"
    ],
    "gratitude": [
      "Gratitude is like a muscle - the more you use it, the stronger it gets. What's one tiny thing you can appreciate right now? 🙏",
      "Even on hard days, there might be small graces: a warm cup of coffee, a text from a friend, or simply that you made it through. ☕",
      "Gratitude doesn't dismiss your struggles; it just makes room for joy alongside them. Both can exist together. 🌗",
      "Your ability to feel grateful, even in small ways, shows the resilience and beauty of your spirit. 🌺"
    ],
    "work": [
      "Work stress is real, and it's okay to feel overwhelmed by professional demands. Your value as a person isn't measured by your productivity. 💼",
      "Try the 'two-minute rule' - if something takes less than 2 minutes, do it now. For bigger tasks, break them into smaller pieces. ⏰",
      "Remember to take micro-breaks - even 30 seconds of deep breathing between tasks can help reset your focus. 🧘‍♀️",
      "Bad days at work don't make you a bad person. Tomorrow is a fresh start with new possibilities. 🌅"
    ],
    "relationships": [
      "Healthy relationships require two people willing to grow, communicate, and support each other. You can only control your part. 💕",
      "It's okay to set boundaries, even with people you love. Saying 'no' to others sometimes means saying 'yes' to yourself. 🚧",
      "Conflict in relationships is normal - it's how you handle it together that matters. Approach with curiosity, not judgment. 🤝",
      "You deserve relationships that feel like sunshine - warm, nurturing, and helping you grow. Don't settle for less. ☀️"
    ],
    "selfcare": [
      "Self-care isn't selfish - it's essential. You can't pour from an empty cup. What would fill your cup today? 🫖",
      "Self-care doesn't have to be expensive or time-consuming. Sometimes it's just drinking water, taking deep breaths, or being kind to yourself. 💧",
      "Listen to your body and mind today. What do you need? Rest? Movement? Connection? Trust your inner wisdom. 👂",
      "Treating yourself with compassion isn't luxury - it's necessary for your well-being and your ability to care for others. 🤗"
    ],
    "default": [
      "Thank you for sharing with me. I'm here to listen and support you. What's on your heart today? 💙",
      "Your feelings matter, and so do you. I'm here to walk alongside you in this moment. How can I help? 🌸",
      "Sometimes we just need someone to remind us that we're not alone. You're not alone - I'm here with you. 💖",
      "I'm honored that you've chosen to share this space with me. Whatever you're feeling is valid and important. 🤲",
      "Every person deserves support and kindness, especially you. I'm here to offer both whenever you need them. 🌈"
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
    
    // Anxiety and worry detection
    if (message.includes('anxious') || message.includes('anxiety') || message.includes('worry') || 
        message.includes('panic') || message.includes('nervous') || message.includes('scared') ||
        message.includes('afraid') || message.includes('fear')) {
      return botResponses.anxiety[Math.floor(Math.random() * botResponses.anxiety.length)];
    }
    
    // Loneliness detection
    if (message.includes('lonely') || message.includes('alone') || message.includes('isolated') ||
        message.includes('friendless') || message.includes('nobody') || message.includes('disconnected')) {
      return botResponses.lonely[Math.floor(Math.random() * botResponses.lonely.length)];
    }
    
    // Sleep issues
    if (message.includes('sleep') || message.includes('insomnia') || message.includes('tired') ||
        message.includes('exhausted') || message.includes('can\'t sleep') || message.includes('restless')) {
      return botResponses.sleep[Math.floor(Math.random() * botResponses.sleep.length)];
    }
    
    // Work and career stress
    if (message.includes('work') || message.includes('job') || message.includes('career') ||
        message.includes('boss') || message.includes('colleague') || message.includes('deadline') ||
        message.includes('productivity') || message.includes('burnout')) {
      return botResponses.work[Math.floor(Math.random() * botResponses.work.length)];
    }
    
    // Relationship issues
    if (message.includes('relationship') || message.includes('partner') || message.includes('boyfriend') ||
        message.includes('girlfriend') || message.includes('spouse') || message.includes('family') ||
        message.includes('friend') || message.includes('conflict') || message.includes('argument') ||
        message.includes('breakup') || message.includes('divorce')) {
      return botResponses.relationships[Math.floor(Math.random() * botResponses.relationships.length)];
    }
    
    // Self-care requests
    if (message.includes('self care') || message.includes('self-care') || message.includes('take care') ||
        message.includes('exhausted') || message.includes('burnout') || message.includes('recharge')) {
      return botResponses.selfcare[Math.floor(Math.random() * botResponses.selfcare.length)];
    }
    
    // Gratitude
    if (message.includes('grateful') || message.includes('gratitude') || message.includes('thankful') ||
        message.includes('appreciate') || message.includes('blessing')) {
      return botResponses.gratitude[Math.floor(Math.random() * botResponses.gratitude.length)];
    }
    
    // Overwhelmed feelings
    if (message.includes('overwhelm') || message.includes('stress') || message.includes('too much') ||
        message.includes('can\'t cope') || message.includes('breaking point') || message.includes('swamped')) {
      return botResponses.overwhelmed[Math.floor(Math.random() * botResponses.overwhelmed.length)];
    }
    
    // Positive content requests
    if (message.includes('positive') || message.includes('good') || message.includes('happy') ||
        message.includes('uplifting') || message.includes('cheerful') || message.includes('joy')) {
      return botResponses.positive[Math.floor(Math.random() * botResponses.positive.length)];
    }
    
    // Relaxation requests
    if (message.includes('relax') || message.includes('calm') || message.includes('peace') ||
        message.includes('unwind') || message.includes('destress') || message.includes('tranquil')) {
      return botResponses.relax[Math.floor(Math.random() * botResponses.relax.length)];
    }
    
    // Difficult times
    if (message.includes('difficult') || message.includes('hard') || message.includes('tough') || 
        message.includes('bad day') || message.includes('struggling') || message.includes('rough')) {
      return botResponses.difficult[Math.floor(Math.random() * botResponses.difficult.length)];
    }
    
    // Breathing exercises
    if (message.includes('breath') || message.includes('breathing') || message.includes('hyperventilat')) {
      return botResponses.breathing[Math.floor(Math.random() * botResponses.breathing.length)];
    }
    
    // Motivation and encouragement
    if (message.includes('motivat') || message.includes('inspire') || message.includes('encourage') ||
        message.includes('confidence') || message.includes('believe') || message.includes('strength')) {
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