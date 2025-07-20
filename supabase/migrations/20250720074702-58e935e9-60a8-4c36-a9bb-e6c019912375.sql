-- Add cascade delete for comments when affirmations are deleted
ALTER TABLE public.comments 
ADD CONSTRAINT fk_comments_affirmation_id 
FOREIGN KEY (affirmation_id) 
REFERENCES public.affirmations(id) 
ON DELETE CASCADE;