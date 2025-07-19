import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Send, User, UserX } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  author_name: string | null;
  is_anonymous: boolean;
  created_at: string;
  user_id: string;
}

interface CommentsProps {
  postId: string;
  postType: 'affirmation' | 'gratitude';
  commentCount?: number;
  onCommentAdded?: () => void;
}

export const Comments: React.FC<CommentsProps> = ({ 
  postId, 
  postType, 
  commentCount = 0,
  onCommentAdded 
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, postId]);

  const fetchComments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq(postType === 'affirmation' ? 'affirmation_id' : 'gratitude_id', postId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      setComments(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast({
        title: "Please write a comment",
        description: "Your comment cannot be empty",
        variant: "destructive"
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to comment",
        variant: "destructive"
      });
      return;
    }

    try {
      const commentData = {
        user_id: user.id,
        content: newComment.trim(),
        is_anonymous: isAnonymous,
        author_name: isAnonymous ? null : user.name,
        [postType === 'affirmation' ? 'affirmation_id' : 'gratitude_id']: postId
      };

      const { error } = await supabase
        .from('comments')
        .insert(commentData);

      if (error) {
        throw error;
      }

      // Refresh comments after successful insert
      await fetchComments();
      setNewComment('');
      setIsAnonymous(false);
      onCommentAdded?.();

      toast({
        title: "Comment added! 💬",
        description: "Thank you for engaging with the community"
      });
    } catch (error) {
      console.error('Error saving comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive"
      });
    }
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
    <div className="space-y-3">
      {/* Comment Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowComments(!showComments)}
        className="text-muted-foreground hover:text-foreground"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        {commentCount > 0 ? `${commentCount} comments` : 'Add comment'}
      </Button>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-4 pl-4 border-l-2 border-border">
          {/* Add Comment Form */}
          <Card className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="comment" className="text-sm font-medium">
                  Add a comment
                </Label>
                <Textarea
                  id="comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="min-h-20 rounded-xl border-border/50 focus:ring-primary focus:border-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                    id="comment-anonymous"
                  />
                  <Label htmlFor="comment-anonymous" className="text-sm cursor-pointer">
                    Comment anonymously
                  </Label>
                </div>

                <Button type="submit" size="sm" className="px-4">
                  <Send className="w-4 h-4 mr-1" />
                  Post
                </Button>
              </div>
            </form>
          </Card>

          {/* Comments List */}
          {loading ? (
            <div className="text-center text-muted-foreground py-4">
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <Card key={comment.id} className="p-4">
                  <div className="space-y-2">
                    <p className="text-foreground leading-relaxed">
                      {comment.content}
                    </p>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      {comment.is_anonymous ? (
                        <>
                          <UserX className="w-3 h-3" />
                          <span>Anonymous</span>
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3" />
                          <span>{comment.author_name || 'Community Member'}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{formatDate(comment.created_at)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};