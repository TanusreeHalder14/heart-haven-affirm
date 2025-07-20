-- Create storage bucket for affirmation images
INSERT INTO storage.buckets (id, name, public) VALUES ('affirmation-images', 'affirmation-images', true);

-- Create storage policies for affirmation images
CREATE POLICY "Affirmation images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'affirmation-images');

CREATE POLICY "Users can upload affirmation images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'affirmation-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own affirmation images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'affirmation-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own affirmation images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'affirmation-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add image_url column to affirmations table
ALTER TABLE public.affirmations ADD COLUMN image_url TEXT;