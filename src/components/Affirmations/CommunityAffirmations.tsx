import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Affirmation } from '@/types';
import { Heart, Plus, MessageCircle, RefreshCw, User, UserX } from 'lucide-react';

export const CommunityAffirmations: React.FC = () => {
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [newAffirmation, setNewAffirmation] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [likedAffirmations, setLikedAffirmations] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { toast } = useToast();

  // Mock affirmations for initial data
  const mockAffirmations: Affirmation[] = [
    {
      id: '1',
      content: "You are capable of amazing things. Trust in your journey and believe in your strength. 💪✨",
      author: "Sarah M.",
      isAnonymous: false,
      likes: 12,
      date: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    },
    {
      id: '2',
      content: "Every sunset brings the promise of a new dawn. Your story isn't over yet. 🌅",
      author: null,
      isAnonymous: true,
      likes: 8,
      date: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    },
    {
      id: '3',
      content: "You don't have to be perfect to be worthy of love and respect. You are enough, exactly as you are. 💖",
      author: "Alex K.",
      isAnonymous: false,
      likes: 15,
      date: new Date(Date.now() - 259200000).toISOString() // 3 days ago
    },
    {
      id: '4',
      content: "Your feelings are valid. Your struggles are real. Your healing matters. Take it one day at a time. 🌱",
      author: null,
      isAnonymous: true,
      likes: 20,
      date: new Date(Date.now() - 345600000).toISOString() // 4 days ago
    },
    {
      id: '5',
      content: "Progress isn't always linear. Sometimes the bravest thing you can do is rest and recharge. 🌙",
      author: "Jordan L.",
      isAnonymous: false,
      likes: 9,
      date: new Date(Date.now() - 432000000).toISOString() // 5 days ago
    }
  ];

  useEffect(() => {
    // Load affirmations from localStorage or use mock data
    const stored = localStorage.getItem('community_affirmations');
    if (stored) {
      setAffirmations(JSON.parse(stored));
    } else {
      setAffirmations(mockAffirmations);
      localStorage.setItem('community_affirmations', JSON.stringify(mockAffirmations));
    }

    // Load liked affirmations
    const likedStored = localStorage.getItem(`liked_affirmations_${user?.id}`);
    if (likedStored) {
      setLikedAffirmations(new Set(JSON.parse(likedStored)));
    }
  }, [user?.id]);

  const saveAffirmations = (newAffirmations: Affirmation[]) => {
    localStorage.setItem('community_affirmations', JSON.stringify(newAffirmations));
    setAffirmations(newAffirmations);
  };

  const saveLikedAffirmations = (liked: Set<string>) => {
    localStorage.setItem(`liked_affirmations_${user?.id}`, JSON.stringify([...liked]));
    setLikedAffirmations(liked);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAffirmation.trim()) {
      toast({
        title: "Please write an affirmation",
        description: "Share something positive with the community",
        variant: "destructive"
      });
      return;
    }

    const affirmation: Affirmation = {
      id: Date.now().toString(),
      content: newAffirmation.trim(),
      author: isAnonymous ? null : user?.name || 'Anonymous',
      isAnonymous,
      likes: 0,
      date: new Date().toISOString()
    };

    const updatedAffirmations = [affirmation, ...affirmations];
    saveAffirmations(updatedAffirmations);

    setNewAffirmation('');
    setIsAnonymous(false);

    toast({
      title: "Affirmation shared! 🌟",
      description: "Thank you for spreading positivity"
    });
  };

  const handleLike = (affirmationId: string) => {
    const newLiked = new Set(likedAffirmations);
    const affirmationsCopy = [...affirmations];
    const affirmationIndex = affirmationsCopy.findIndex(a => a.id === affirmationId);
    
    if (affirmationIndex === -1) return;

    if (likedAffirmations.has(affirmationId)) {
      // Unlike
      newLiked.delete(affirmationId);
      affirmationsCopy[affirmationIndex].likes--;
    } else {
      // Like
      newLiked.add(affirmationId);
      affirmationsCopy[affirmationIndex].likes++;
    }

    saveLikedAffirmations(newLiked);
    saveAffirmations(affirmationsCopy);
  };

  const shuffleAffirmations = () => {
    const shuffled = [...affirmations].sort(() => Math.random() - 0.5);
    setAffirmations(shuffled);
    toast({
      title: "Affirmations refreshed! ✨",
      description: "Discover new inspiring messages"
    });
  };

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
        <h1 className="text-4xl font-bold text-glow">Community Affirmations</h1>
        <p className="text-xl text-muted-foreground">
          Share kindness and find inspiration from our loving community
        </p>
      </div>

      {/* Create New Affirmation */}
      <Card className="card-floating">
        <h2 className="text-2xl font-semibold mb-6 flex items-center space-x-2">
          <Plus className="w-6 h-6 text-primary" />
          <span>Share an affirmation</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="affirmation" className="text-sm font-medium">
              Write a kind message for someone today
            </Label>
            <Textarea
              id="affirmation"
              value={newAffirmation}
              onChange={(e) => setNewAffirmation(e.target.value)}
              placeholder="Share something uplifting, encouraging, or inspiring..."
              className="min-h-24 rounded-2xl border-border/50 focus:ring-primary focus:border-primary resize-none"
            />
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
              Share Love
            </Button>
          </div>
        </form>
      </Card>

      {/* Affirmations Feed */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Messages of Love</h2>
          <Button
            onClick={shuffleAffirmations}
            variant="outline"
            className="rounded-2xl border-border/50 hover:bg-primary/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {affirmations.length === 0 ? (
          <Card className="card-gentle text-center py-12">
            <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No affirmations yet</h3>
            <p className="text-muted-foreground">
              Be the first to share a positive message with the community
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {affirmations.map((affirmation) => (
              <Card key={affirmation.id} className="card-gentle group hover:shadow-glow transition-all duration-500">
                <div className="space-y-4">
                  <p className="text-foreground leading-relaxed text-lg">
                    {affirmation.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      {affirmation.isAnonymous ? (
                        <>
                          <UserX className="w-4 h-4" />
                          <span>Anonymous</span>
                        </>
                      ) : (
                        <>
                          <User className="w-4 h-4" />
                          <span>{affirmation.author}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{formatDate(affirmation.date)}</span>
                    </div>

                    <button
                      onClick={() => handleLike(affirmation.id)}
                      className={`flex items-center space-x-2 px-3 py-1 rounded-xl transition-all duration-300 ${
                        likedAffirmations.has(affirmation.id)
                          ? 'bg-primary/20 text-primary'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Heart 
                        className={`w-4 h-4 ${
                          likedAffirmations.has(affirmation.id) ? 'fill-current' : ''
                        }`} 
                      />
                      <span className="text-sm font-medium">{affirmation.likes}</span>
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};