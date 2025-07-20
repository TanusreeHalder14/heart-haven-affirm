import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Heart, BookOpen, Smile, Bot, MessageCircle, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardHomeProps {
  onSectionChange: (section: string) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ onSectionChange }) => {
  const { user } = useAuth();
  const [recentEntries, setRecentEntries] = useState<{
    gratitude: any[];
    mood: any[];
    affirmations: any[];
  }>({
    gratitude: [],
    mood: [],
    affirmations: []
  });
  const [stats, setStats] = useState([
    { title: "Gratitude Entries", value: "0", period: "this week" },
    { title: "Mood Average", value: "0", period: "this week" },
    { title: "Affirmations", value: "0", period: "shared" },
  ]);

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
      title: 'Inner Voice',
      description: 'Share and read community inner voices',
      icon: MessageCircle,
      color: 'primary',
      gradient: 'gradient-primary'
    }
  ];

  // Fetch recent entries and stats
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        // Fetch recent gratitude entries
        const { data: gratitudeData } = await supabase
          .from('gratitude_entries')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        // Fetch recent mood entries  
        const { data: moodData } = await supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        // Fetch recent inner voice posts
        const { data: affirmationsData } = await supabase
          .from('affirmations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        setRecentEntries({
          gratitude: gratitudeData || [],
          mood: moodData || [],
          affirmations: affirmationsData || []
        });

        // Calculate stats
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        // Count user's gratitude entries this week
        const { count: gratitudeCount } = await supabase
          .from('gratitude_entries')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', weekAgo.toISOString());

        // Calculate mood average this week
        const { data: weekMoods } = await supabase
          .from('mood_entries')
          .select('mood_score')
          .eq('user_id', user.id)
          .gte('created_at', weekAgo.toISOString());

        const avgMood = weekMoods && weekMoods.length > 0 
          ? (weekMoods.reduce((sum, entry) => sum + entry.mood_score, 0) / weekMoods.length).toFixed(1)
          : "0";

        // Count user's inner voice posts
        const { count: affirmationsCount } = await supabase
          .from('affirmations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        setStats([
          { title: "Gratitude Entries", value: gratitudeCount?.toString() || "0", period: "this week" },
          { title: "Mood Average", value: avgMood, period: "this week" },
          { title: "Inner Voice Posts", value: affirmationsCount?.toString() || "0", period: "shared" },
        ]);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, [user]);

  const displayStats = [
    { label: 'Gratitude Entries', value: stats[0]?.value || '0', icon: BookOpen },
    { label: 'Mood Average', value: stats[1]?.value || '0', icon: TrendingUp },
    { label: 'HeartBot Chats', value: '5', icon: Bot },
    { label: 'Inner Voice Posts', value: stats[2]?.value || '0', icon: Heart }
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

      {/* Recent Activity */}
      <Card className="card-gentle">
        <h2 className="text-2xl font-semibold mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {recentEntries.gratitude.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Latest Gratitude</h4>
              {recentEntries.gratitude.slice(0, 2).map((entry) => (
                <div key={entry.id} className="text-sm p-3 bg-muted rounded-lg mb-2">
                  {entry.entry.substring(0, 100)}...
                </div>
              ))}
            </div>
          )}
          
          {recentEntries.mood.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Recent Mood</h4>
              <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                <span className="text-lg">😊</span>
                <span className="text-sm">Mood score: {recentEntries.mood[0].mood_score}/10</span>
              </div>
            </div>
          )}

          {recentEntries.affirmations.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Latest Inner Voice</h4>
              <div className="text-sm p-3 bg-muted rounded-lg">
                {recentEntries.affirmations[0].content.substring(0, 100)}...
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Stats Overview */}
      <Card className="card-gentle">
        <h2 className="text-2xl font-semibold mb-6 text-center">Your Wellness Journey</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {displayStats.map((stat) => {
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