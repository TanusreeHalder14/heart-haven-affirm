import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Heart, BookOpen, Smile, Bot, MessageCircle, TrendingUp } from 'lucide-react';

interface DashboardHomeProps {
  onSectionChange: (section: string) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ onSectionChange }) => {
  const { user } = useAuth();

  const quickActions = [
    {
      id: 'gratitude',
      title: 'Write Gratitude',
      description: 'Capture what you\'re grateful for today',
      icon: BookOpen,
      color: 'wellness',
      gradient: 'gradient-wellness'
    },
    {
      id: 'mood',
      title: 'Track Mood',
      description: 'How are you feeling right now?',
      icon: Smile,
      color: 'joy',
      gradient: 'gradient-primary'
    },
    {
      id: 'heartbot',
      title: 'Chat with HeartBot',
      description: 'Get emotional support and guidance',
      icon: Bot,
      color: 'calm',
      gradient: 'gradient-calm'
    },
    {
      id: 'affirmations',
      title: 'Read Affirmations',
      description: 'Find inspiration from the community',
      icon: MessageCircle,
      color: 'primary',
      gradient: 'gradient-primary'
    }
  ];

  const stats = [
    { label: 'Gratitude Entries', value: '12', icon: BookOpen },
    { label: 'Days Tracked', value: '8', icon: TrendingUp },
    { label: 'HeartBot Chats', value: '5', icon: Bot },
    { label: 'Affirmations Liked', value: '23', icon: Heart }
  ];

  return (
    <div className="p-8 space-y-8 fade-in">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-glow">
          Welcome back, {user?.name?.split(' ')[0]} 💖
        </h1>
        <p className="text-xl text-muted-foreground">
          How can we support your wellbeing today?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.id}
              className="card-floating cursor-pointer group"
              onClick={() => onSectionChange(action.id)}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-2xl bg-${action.color}/20 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 text-${action.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
                  <p className="text-muted-foreground">{action.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Stats Overview */}
      <Card className="card-gentle">
        <h2 className="text-2xl font-semibold mb-6 text-center">Your Wellness Journey</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center space-y-2">
                <div className="flex justify-center">
                  <div className="p-3 rounded-2xl bg-primary/20">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Daily Inspiration */}
      <Card className="card-floating text-center">
        <div className="space-y-4">
          <Heart className="w-12 h-12 text-primary mx-auto" />
          <h3 className="text-xl font-semibold">Daily Inspiration</h3>
          <p className="text-lg text-muted-foreground italic">
            "Every moment is a fresh beginning. Take a deep breath and start again."
          </p>
          <p className="text-sm text-muted-foreground">- Unknown</p>
        </div>
      </Card>
    </div>
  );
};