import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { MoodEntry } from '@/types';
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react';

export const MoodTracker: React.FC = () => {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [note, setNote] = useState('');
  const [viewMode, setViewMode] = useState<'track' | 'chart'>('track');
  const { user } = useAuth();
  const { toast } = useToast();

  const moods = [
    { name: 'Happy', emoji: '😊', color: 'joy', description: 'Feeling great and positive' },
    { name: 'Neutral', emoji: '😐', color: 'muted', description: 'Balanced and calm' },
    { name: 'Sad', emoji: '😢', color: 'calm', description: 'Feeling down or blue' },
    { name: 'Anxious', emoji: '😰', color: 'destructive', description: 'Worried or stressed' },
    { name: 'Excited', emoji: '🤩', color: 'wellness', description: 'Energetic and enthusiastic' }
  ];

  useEffect(() => {
    const stored = localStorage.getItem(`mood_entries_${user?.id}`);
    if (stored) {
      setEntries(JSON.parse(stored));
    }
  }, [user?.id]);

  const saveEntries = (newEntries: MoodEntry[]) => {
    localStorage.setItem(`mood_entries_${user?.id}`, JSON.stringify(newEntries));
    setEntries(newEntries);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMood) {
      toast({
        title: "Please select a mood",
        description: "How are you feeling right now?",
        variant: "destructive"
      });
      return;
    }

    // Check if already tracked today
    const today = new Date().toDateString();
    const hasEntryToday = entries.some(entry => 
      new Date(entry.date).toDateString() === today
    );

    if (hasEntryToday) {
      toast({
        title: "Already tracked today",
        description: "You can track your mood once per day. Come back tomorrow!",
        variant: "destructive"
      });
      return;
    }

    const entry: MoodEntry = {
      id: Date.now().toString(),
      mood: selectedMood as any,
      note: note.trim(),
      date: new Date().toISOString(),
      userId: user?.id || ''
    };

    const updatedEntries = [entry, ...entries];
    saveEntries(updatedEntries);

    setSelectedMood('');
    setNote('');

    toast({
      title: "Mood tracked! 📊",
      description: "Thank you for checking in with yourself"
    });
  };

  const getMoodStats = () => {
    const last7Days = entries.slice(0, 7);
    const moodCounts = last7Days.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommon = Object.entries(moodCounts).sort(([,a], [,b]) => b - a)[0];
    return { last7Days: last7Days.length, mostCommon: mostCommon?.[0] };
  };

  const stats = getMoodStats();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMoodEmoji = (moodName: string) => {
    return moods.find(m => m.name === moodName)?.emoji || '😊';
  };

  return (
    <div className="p-8 space-y-8 fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-glow">Mood Tracker</h1>
        <p className="text-xl text-muted-foreground">
          Track your emotional journey and discover patterns
        </p>
      </div>

      {/* View Toggle */}
      <div className="flex justify-center">
        <div className="bg-muted rounded-2xl p-1 flex">
          <button
            onClick={() => setViewMode('track')}
            className={`px-6 py-2 rounded-xl transition-all duration-300 ${
              viewMode === 'track'
                ? 'bg-primary text-primary-foreground shadow-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Track Mood
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`px-6 py-2 rounded-xl transition-all duration-300 ${
              viewMode === 'chart'
                ? 'bg-primary text-primary-foreground shadow-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            View Insights
          </button>
        </div>
      </div>

      {viewMode === 'track' ? (
        /* Mood Tracking Form */
        <Card className="card-floating max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-center">How are you feeling today?</h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {moods.map((mood) => (
                <button
                  key={mood.name}
                  type="button"
                  onClick={() => setSelectedMood(mood.name)}
                  className={`mood-emoji mood-${mood.name.toLowerCase()} text-center p-6 rounded-2xl transition-all duration-300 ${
                    selectedMood === mood.name
                      ? 'scale-110 shadow-medium ring-2 ring-primary'
                      : 'hover:scale-105'
                  }`}
                >
                  <div className="text-4xl mb-2">{mood.emoji}</div>
                  <div className="font-medium">{mood.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{mood.description}</div>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="note" className="text-sm font-medium">
                Why do you feel this way? (optional)
              </Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's influencing your mood today?"
                className="rounded-2xl border-border/50 focus:ring-primary focus:border-primary resize-none"
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full btn-healing text-lg py-4">
              <TrendingUp className="w-5 h-5 mr-2" />
              Track Mood
            </Button>
          </form>
        </Card>
      ) : (
        /* Mood Insights */
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="card-gentle text-center">
              <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{stats.last7Days}</div>
              <div className="text-sm text-muted-foreground">Days tracked this week</div>
            </Card>

            <Card className="card-gentle text-center">
              <div className="text-3xl mb-2">
                {stats.mostCommon ? getMoodEmoji(stats.mostCommon) : '📊'}
              </div>
              <div className="font-medium">{stats.mostCommon || 'No data'}</div>
              <div className="text-sm text-muted-foreground">Most common mood</div>
            </Card>

            <Card className="card-gentle text-center">
              <BarChart3 className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{entries.length}</div>
              <div className="text-sm text-muted-foreground">Total entries</div>
            </Card>
          </div>

          {/* Recent Entries */}
          <Card className="card-floating">
            <h3 className="text-xl font-semibold mb-6">Recent Mood History</h3>
            {entries.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-muted-foreground">
                  Start tracking your mood to see insights here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.slice(0, 10).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{getMoodEmoji(entry.mood)}</div>
                      <div>
                        <div className="font-medium">{entry.mood}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(entry.date)}
                        </div>
                      </div>
                    </div>
                    {entry.note && (
                      <div className="text-sm text-muted-foreground italic max-w-md">
                        "{entry.note}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};