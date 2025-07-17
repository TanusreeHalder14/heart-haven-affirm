import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { GratitudeEntry } from '@/types';
import { Heart, Plus, Calendar, Tag, Smile } from 'lucide-react';

export const GratitudeJournal: React.FC = () => {
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const { user } = useAuth();
  const { toast } = useToast();

  const categories = ['Health', 'Relationships', 'Self', 'Work'];
  const emojis = ['💖', '🌟', '🌈', '🙏', '☀️', '🌸', '✨', '🎉'];

  useEffect(() => {
    if (user?.id) {
      fetchGratitudeEntries();
    }
  }, [user?.id]);

  const fetchGratitudeEntries = async () => {
    if (!user?.id) return;
    
    const { data, error } = await supabase
      .from('gratitude_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching gratitude entries:', error);
      return;
    }
    
    const formattedEntries: GratitudeEntry[] = data.map((entry: any) => ({
      id: entry.id,
      content: entry.entry,
      category: 'Self', // Default category as it's not stored in DB yet
      emoji: '', // Not stored in DB yet
      date: entry.created_at,
      userId: entry.user_id
    }));
    
    setEntries(formattedEntries);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEntry.trim()) {
      toast({
        title: "Please write something",
        description: "Your gratitude entry cannot be empty",
        variant: "destructive"
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to save entries",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('gratitude_entries')
        .insert({
          user_id: user.id,
          entry: newEntry.trim()
        });

      if (error) {
        throw error;
      }

      // Refresh entries after successful insert
      await fetchGratitudeEntries();

      setNewEntry('');
      setSelectedCategory('');
      setSelectedEmoji('');

      toast({
        title: "Gratitude saved! 🌟",
        description: "Your beautiful moment has been captured"
      });
    } catch (error) {
      console.error('Error saving gratitude entry:', error);
      toast({
        title: "Error",
        description: "Failed to save gratitude entry. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredEntries = entries.filter(entry => 
    filterCategory === 'all' || entry.category === filterCategory
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="p-8 space-y-8 fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-glow">Gratitude Journal</h1>
        <p className="text-xl text-muted-foreground">
          Capture the beautiful moments and blessings in your life
        </p>
      </div>

      {/* New Entry Form */}
      <Card className="card-floating">
        <h2 className="text-2xl font-semibold mb-6 flex items-center space-x-2">
          <Plus className="w-6 h-6 text-primary" />
          <span>What are you grateful for today?</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="gratitude" className="text-sm font-medium">Your gratitude</Label>
            <Textarea
              id="gratitude"
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              placeholder="I'm grateful for..."
              className="min-h-32 rounded-2xl border-border/50 focus:ring-primary focus:border-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="rounded-2xl border-border/50">
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Add an emoji (optional)</Label>
              <div className="flex flex-wrap gap-2">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(selectedEmoji === emoji ? '' : emoji)}
                    className={`text-2xl p-2 rounded-xl transition-all duration-200 ${
                      selectedEmoji === emoji
                        ? 'bg-primary/20 scale-110'
                        : 'hover:bg-muted hover:scale-105'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full btn-healing text-lg py-4">
            <Heart className="w-5 h-5 mr-2" />
            Save Gratitude
          </Button>
        </form>
      </Card>

      {/* Filter and Entries */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Your Gratitude Journey</h2>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48 rounded-2xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredEntries.length === 0 ? (
          <Card className="card-gentle text-center py-12">
            <Smile className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No entries yet</h3>
            <p className="text-muted-foreground">
              {filterCategory === 'all' 
                ? "Start your gratitude journey by writing your first entry above"
                : `No entries found for ${filterCategory} category`
              }
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <Card key={entry.id} className="card-gentle slide-up">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {formatDate(entry.date)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {entry.emoji && (
                      <span className="text-xl">{entry.emoji}</span>
                    )}
                    <div className="flex items-center space-x-1">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium px-2 py-1 rounded-lg bg-primary/10 text-primary">
                        {entry.category}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-foreground leading-relaxed">{entry.content}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};