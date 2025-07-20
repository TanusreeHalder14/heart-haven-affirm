import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { GratitudeEntry } from '@/types';
import { Heart, Plus, Calendar, Tag, Smile, User, UserX, RefreshCw } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { Comments } from '@/components/ui/comments';

export const GratitudeJournal: React.FC = () => {
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [likedEntries, setLikedEntries] = useState<Set<string>>(new Set());
  const [commentCounts, setCommentCounts] = useState<{[key: string]: number}>({});
  const { user } = useAuth();
  const { toast } = useToast();

  const categories = ['Health', 'Relationships', 'Self', 'Work'];
  const emojis = ['💖', '🌟', '🌈', '🙏', '☀️', '🌸', '✨', '🎉'];

  useEffect(() => {
    if (user?.id) {
      fetchGratitudeEntries();
    }
  }, [user?.id]);

  const fetchCommentCounts = async (entryIds: string[]) => {
    const counts: {[key: string]: number} = {};
    
    for (const id of entryIds) {
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('gratitude_id', id);
      
      counts[id] = count || 0;
    }
    
    setCommentCounts(counts);
  };

  const fetchGratitudeEntries = async () => {
    const { data, error } = await supabase
      .from('gratitude_entries')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching gratitude entries:', error);
      return;
    }
    
    const formattedEntries: GratitudeEntry[] = data.map((entry: any) => ({
      id: entry.id,
      content: entry.entry,
      category: entry.category || 'Self',
      emoji: '', // Not used in updated version
      date: entry.created_at,
      userId: entry.user_id,
      isAnonymous: entry.is_anonymous,
      author: entry.author_name,
      likes: entry.likes || 0
    }));
    
    setEntries(formattedEntries);
    
    // Fetch comment counts
    const entryIds = formattedEntries.map(e => e.id);
    await fetchCommentCounts(entryIds);
    
    // Fetch user's liked entries
    if (user?.id) {
      const { data: likes } = await supabase
        .from('gratitude_likes')
        .select('gratitude_id')
        .eq('user_id', user.id);
      
      if (likes) {
        setLikedEntries(new Set(likes.map(like => like.gratitude_id)));
      }
    }
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
          entry: newEntry.trim(),
          is_anonymous: isAnonymous,
          author_name: isAnonymous ? null : user.name,
          category: selectedCategory || 'Self'
        });

      if (error) {
        throw error;
      }

      // Refresh entries after successful insert
      await fetchGratitudeEntries();

      setNewEntry('');
      setSelectedCategory('');
      setSelectedEmoji('');
      setIsAnonymous(false);

      toast({
        title: "Gratitude shared! 🌟",
        description: "Your gratitude has been shared with the community"
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

  const handleLike = async (entryId: string) => {
    if (!user?.id) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to like entries",
        variant: "destructive"
      });
      return;
    }

    const isLiked = likedEntries.has(entryId);
    
    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from('gratitude_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('gratitude_id', entryId);
        
        const newLiked = new Set(likedEntries);
        newLiked.delete(entryId);
        setLikedEntries(newLiked);
        
        // Update local state
        setEntries(prev => prev.map(entry => 
          entry.id === entryId ? { ...entry, likes: entry.likes - 1 } : entry
        ));
      } else {
        // Like
        await supabase
          .from('gratitude_likes')
          .insert({
            user_id: user.id,
            gratitude_id: entryId
          });
        
        const newLiked = new Set(likedEntries);
        newLiked.add(entryId);
        setLikedEntries(newLiked);
        
        // Update local state
        setEntries(prev => prev.map(entry => 
          entry.id === entryId ? { ...entry, likes: entry.likes + 1 } : entry
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive"
      });
    }
  };

  const shuffleEntries = () => {
    const shuffled = [...entries].sort(() => Math.random() - 0.5);
    setEntries(shuffled);
    toast({
      title: "Gratitude refreshed! ✨",
      description: "Discover new inspiring messages"
    });
  };

  const filteredEntries = entries.filter(entry => 
    filterCategory === 'all' || entry.category === filterCategory
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
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

          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Switch
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
                id="anonymous"
              />
              <Label htmlFor="anonymous" className="text-sm cursor-pointer">
                Post anonymously
              </Label>
            </div>

            <Button type="submit" className="btn-healing px-8">
              <Heart className="w-4 h-4 mr-2" />
              Share Gratitude
            </Button>
          </div>
        </form>
      </Card>

      {/* Filter and Entries */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Community Gratitude</h2>
          <div className="flex items-center space-x-4">
            <Button
              onClick={shuffleEntries}
              variant="outline"
              className="rounded-2xl border-border/50 hover:bg-primary/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEntries.map((entry) => (
              <Card key={entry.id} className="card-gentle group hover:shadow-glow transition-all duration-500">
                <div className="space-y-4 relative">
                  {/* Delete button in top-right corner */}
                  {user?.id === entry.userId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Add delete functionality for gratitude entries
                        console.log('Delete gratitude entry:', entry.id);
                      }}
                      className="absolute top-0 right-0 text-destructive hover:text-destructive hover:bg-destructive/10 z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <p className="text-foreground leading-relaxed text-lg">
                    {entry.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      {entry.isAnonymous ? (
                        <>
                          <UserX className="w-4 h-4" />
                          <span>Anonymous</span>
                        </>
                      ) : (
                        <>
                          <User className="w-4 h-4" />
                          <span>{entry.author || 'Community Member'}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{formatDate(entry.date)}</span>
                    </div>

                    <button
                      onClick={() => handleLike(entry.id)}
                      className={`flex items-center space-x-2 px-3 py-1 rounded-xl transition-all duration-300 ${
                        likedEntries.has(entry.id)
                          ? 'bg-primary/20 text-primary'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Heart 
                        className={`w-4 h-4 ${
                          likedEntries.has(entry.id) ? 'fill-current' : ''
                        }`} 
                      />
                      <span className="text-sm font-medium">{entry.likes}</span>
                    </button>
                  </div>
                  
                  {/* Comments Section */}
                  <Comments 
                    postId={entry.id} 
                    postType="gratitude"
                    commentCount={commentCounts[entry.id] || 0}
                    onCommentAdded={fetchGratitudeEntries}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};