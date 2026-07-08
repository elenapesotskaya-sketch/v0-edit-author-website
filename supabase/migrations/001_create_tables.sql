-- Create author_info table
CREATE TABLE IF NOT EXISTS public.author_info (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name TEXT NOT NULL,
  bio TEXT,
  image TEXT,
  tagline TEXT,
  genre_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tales table
CREATE TABLE IF NOT EXISTS public.tales (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  full_text TEXT,
  image TEXT,
  likes INTEGER DEFAULT 0,
  published_date TEXT,
  reading_time TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id TEXT PRIMARY KEY,
  tale_id TEXT NOT NULL REFERENCES public.tales(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tales_published_date ON public.tales(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_comments_tale_id ON public.comments(tale_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);

-- Create function to increment likes
CREATE OR REPLACE FUNCTION public.increment_likes(tale_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  new_likes INTEGER;
BEGIN
  UPDATE public.tales
  SET likes = likes + 1,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = tale_id
  RETURNING likes INTO new_likes;
  
  RETURN COALESCE(new_likes, 0);
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE public.author_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Enable public read on author_info" ON public.author_info
  FOR SELECT USING (true);

CREATE POLICY "Enable public read on tales" ON public.tales
  FOR SELECT USING (true);

CREATE POLICY "Enable public read on comments" ON public.comments
  FOR SELECT USING (true);

-- Allow inserts for comments from authenticated users or anyone with password
CREATE POLICY "Enable insert on comments" ON public.comments
  FOR INSERT WITH CHECK (true);

-- Allow updates/deletes only from admin (would need to implement admin check)
CREATE POLICY "Enable update on author_info" ON public.author_info
  FOR UPDATE USING (true);

CREATE POLICY "Enable update on tales" ON public.tales
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete on tales" ON public.tales
  FOR DELETE USING (true);

CREATE POLICY "Enable insert on tales" ON public.tales
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable insert on author_info" ON public.author_info
  FOR INSERT WITH CHECK (true);
