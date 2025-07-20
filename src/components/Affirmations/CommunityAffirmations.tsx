import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Affirmation } from '@/types';
import { Heart, Plus, MessageCircle, RefreshCw, User, UserX, Image, X, Trash2 } from 'lucide-react';
import { Comments } from '@/components/ui/comments';

export const CommunityAffirmations: React.FC = () => {
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [newAffirmation, setNewAffirmation] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [likedAffirmations, setLikedAffirmations] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [commentCounts, setCommentCounts] = useState<{[key: string]: number}>({});
  const [currentUser, setCurrentUser] = useState<any>(null);
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
    fetchAffirmations();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchCommentCounts = async (affirmationIds: string[]) => {
    const counts: {[key: string]: number} = {};
    
    for (const id of affirmationIds) {
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('affirmation_id', id);
      
      counts[id] = count || 0;
    }
    
    setCommentCounts(counts);
  };

  const fetchAffirmations = async () => {
    const { data, error } = await supabase
      .from('affirmations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching affirmations:', error);
      // Use mock data as fallback
      setAffirmations(mockAffirmations);
      return;
    }
    
    const formattedAffirmations: Affirmation[] = data.map((affirmation: any) => ({
      id: affirmation.id,
      content: affirmation.content,
      author: affirmation.author_name || 'Community Member',
      isAnonymous: affirmation.is_anonymous,
      likes: 0, // Will be updated with real likes data
      date: affirmation.created_at,
      imageUrl: affirmation.image_url,
      userId: affirmation.user_id
    }));
    
    setAffirmations(formattedAffirmations);
    
    // Fetch comment counts
    const affirmationIds = formattedAffirmations.map(a => a.id);
    await fetchCommentCounts(affirmationIds);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const uploadImage = async (file: File, userId: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('affirmation-images')
      .upload(fileName, file);
    
    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('affirmation-images')
      .getPublicUrl(data.path);
    
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAffirmation.trim()) {
      toast({
        title: "Please write your inner voice",
        description: "Share something with the community",
        variant: "destructive"
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to share your inner voice",
        variant: "destructive"
      });
      return;
    }

    try {
      let imageUrl = null;
      
      // Upload image if selected
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage, user.id);
        if (!imageUrl) {
          toast({
            title: "Image upload failed",
            description: "Please try again or post without image",
            variant: "destructive"
          });
          return;
        }
      }

      const { error } = await supabase
        .from('affirmations')
        .insert({
          user_id: user.id,
          content: newAffirmation.trim(),
          is_anonymous: isAnonymous,
          author_name: isAnonymous ? null : user.name,
          image_url: imageUrl
        });

      if (error) {
        throw error;
      }

      // Refresh affirmations after successful insert
      await fetchAffirmations();

      setNewAffirmation('');
      setIsAnonymous(false);
      removeImage();

      toast({
        title: "Inner voice shared! 🌟",
        description: "Thank you for sharing with the community"
      });
    } catch (error) {
      console.error('Error saving thoughts:', error);
      toast({
        title: "Error",
        description: "Failed to share inner voice. Please try again.",
        variant: "destructive"
      });
    }
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

    setLikedAffirmations(newLiked);
    setAffirmations(affirmationsCopy);
  };

  const deleteAffirmation = async (id: string) => {
    try {
      const { error } = await supabase
        .from("affirmations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Inner voice deleted",
        description: "Your post has been removed.",
      });
      fetchAffirmations();
    } catch (error) {
      console.error("Error deleting affirmation:", error);
      toast({
        title: "Error",
        description: "Failed to delete your inner voice. Please try again.",
        variant: "destructive",
      });
    }
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
        <h1 className="text-4xl font-bold text-glow">Inner Voice</h1>
        <p className="text-xl text-muted-foreground">
          Share your inner voice and connect with our community
        </p>
      </div>

      {/* Create New Affirmation */}
      <Card className="card-floating">
        <h2 className="text-2xl font-semibold mb-6 flex items-center space-x-2">
          <Plus className="w-6 h-6 text-primary" />
          <span>Share your inner voice</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="affirmation" className="text-sm font-medium">
              What's on your mind?
            </Label>
            <Textarea
              id="affirmation"
              value={newAffirmation}
              onChange={(e) => setNewAffirmation(e.target.value)}
              placeholder="Share your inner voice, feelings, or experiences..."
              className="min-h-24 rounded-2xl border-border/50 focus:ring-primary focus:border-primary resize-none"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Add an image (optional)</Label>
            {!imagePreview ? (
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <Image className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click to add an image</p>
                </Label>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-64 object-cover rounded-xl"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removeImage}
                  className="absolute top-2 right-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
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
              Share Inner Voice
            </Button>
          </div>
        </form>
      </Card>

      {/* Affirmations Feed */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Community Inner Voices</h2>
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
            <h3 className="text-xl font-semibold mb-2">No inner voices yet</h3>
            <p className="text-muted-foreground">
              Be the first to share your inner voice with the community
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {affirmations.map((affirmation) => (
              <Card key={affirmation.id} className="card-gentle group hover:shadow-glow transition-all duration-500">
                <div className="space-y-4">
                  {/* Delete button positioned above content */}
                  {currentUser && currentUser.id === affirmation.userId && (
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAffirmation(affirmation.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  
                  {affirmation.imageUrl && (
                    <img
                      src={affirmation.imageUrl}
                      alt="Shared image"
                      className="w-full max-h-64 object-cover rounded-xl mb-4"
                    />
                  )}
                  
                  <div className="space-y-4">
                    <p className="text-foreground leading-relaxed text-base break-words overflow-wrap-anywhere">
                    {affirmation.content}
                    </p>
                  
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground flex-shrink-0">
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

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                        onClick={() => handleLike(affirmation.id)}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 ${
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
                  
                    {/* Comments Section */}
                    <Comments 
                    postId={affirmation.id} 
                    postType="affirmation"
                    commentCount={commentCounts[affirmation.id] || 0}
                    onCommentAdded={fetchAffirmations}
                    />
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