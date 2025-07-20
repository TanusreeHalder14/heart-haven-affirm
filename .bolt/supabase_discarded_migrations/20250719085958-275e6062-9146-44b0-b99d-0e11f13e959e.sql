-- Create comments table for affirmations and gratitude entries
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  affirmation_id UUID NULL REFERENCES public.affirmations(id) ON DELETE CASCADE,
  gratitude_id UUID NULL REFERENCES public.gratitude_entries(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  author_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT comments_single_reference CHECK (
    (affirmation_id IS NOT NULL AND gratitude_id IS NULL) OR 
    (affirmation_id IS NULL AND gratitude_id IS NOT NULL)
  )
);

-- Add RLS policies for comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all comments" 
ON public.comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own comments" 
ON public.comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add is_anonymous and author_name columns to affirmations table
ALTER TABLE public.affirmations 
ADD COLUMN is_anonymous BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN author_name TEXT;

-- Add category column to gratitude_entries table  
ALTER TABLE public.gratitude_entries 
ADD COLUMN category TEXT DEFAULT 'Self';