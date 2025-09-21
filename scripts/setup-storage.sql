-- Create storage buckets for file uploads
-- Run this in Supabase SQL Editor after creating tables

-- Create avatars bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create posts bucket for social media content
INSERT INTO storage.buckets (id, name, public) 
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- Create stories bucket for story content
INSERT INTO storage.buckets (id, name, public) 
VALUES ('stories', 'stories', true)
ON CONFLICT (id) DO NOTHING;

-- Create qr-codes bucket for generated QR codes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('qr-codes', 'qr-codes', true)
ON CONFLICT (id) DO NOTHING;

-- Create ads bucket for advertisement images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ads', 'ads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for posts bucket
CREATE POLICY "Post images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'posts');

CREATE POLICY "Users can upload their own post media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'posts' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own post media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'posts' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for stories bucket
CREATE POLICY "Story images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'stories');

CREATE POLICY "Users can upload their own story media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'stories' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own story media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'stories' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for QR codes bucket
CREATE POLICY "QR codes are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'qr-codes');

CREATE POLICY "Users can upload their own QR codes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'qr-codes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for ads bucket (admin only)
CREATE POLICY "Ad images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'ads');

CREATE POLICY "Admins can upload ad images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'ads' AND 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can manage ad images" ON storage.objects
  FOR ALL USING (
    bucket_id = 'ads' AND 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );
