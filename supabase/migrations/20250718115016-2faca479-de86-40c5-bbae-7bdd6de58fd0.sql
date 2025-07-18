-- Update RLS policy for gratitude_entries to allow all users to view all entries
DROP POLICY "Users can view their own gratitude entries" ON public.gratitude_entries;

CREATE POLICY "Users can view all gratitude entries" 
ON public.gratitude_entries 
FOR SELECT 
USING (true);