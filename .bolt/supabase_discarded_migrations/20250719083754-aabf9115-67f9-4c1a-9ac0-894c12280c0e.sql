-- Add anonymous posting and likes functionality to gratitude_entries table
ALTER TABLE public.gratitude_entries 
ADD COLUMN is_anonymous BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN likes INTEGER NOT NULL DEFAULT 0,
ADD COLUMN author_name TEXT;

-- Create a likes table to track who liked what (to prevent duplicate likes)
CREATE TABLE public.gratitude_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  gratitude_id UUID NOT NULL REFERENCES public.gratitude_entries(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, gratitude_id)
);

-- Enable RLS on gratitude_likes table
ALTER TABLE public.gratitude_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for gratitude_likes
CREATE POLICY "Users can create their own likes" 
ON public.gratitude_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" 
ON public.gratitude_likes 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view all likes" 
ON public.gratitude_likes 
FOR SELECT 
USING (true);

-- Create trigger to update likes count
CREATE OR REPLACE FUNCTION public.update_gratitude_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.gratitude_entries 
    SET likes = likes + 1 
    WHERE id = NEW.gratitude_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.gratitude_entries 
    SET likes = likes - 1 
    WHERE id = OLD.gratitude_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for likes count
CREATE TRIGGER update_gratitude_likes_count_trigger
  AFTER INSERT OR DELETE ON public.gratitude_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_gratitude_likes_count();