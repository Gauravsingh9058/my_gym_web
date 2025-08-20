/*
  # Initial Schema for FitCore Gym Website

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `full_name` (text)
      - `email` (text)
      - `phone` (text, optional)
      - `membership_type` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `trainers`
      - `id` (uuid, primary key)
      - `name` (text)
      - `specialty` (text)
      - `experience` (text)
      - `bio` (text)
      - `image_url` (text)
      - `rating` (numeric)
      - `created_at` (timestamp)
    
    - `programs`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `duration` (text)
      - `level` (text)
      - `image_url` (text)
      - `trainer_id` (uuid, references trainers)
      - `max_participants` (integer)
      - `created_at` (timestamp)
    
    - `bookings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `program_id` (uuid, references programs)
      - `booking_date` (timestamp)
      - `status` (text, default 'confirmed')
      - `created_at` (timestamp)
    
    - `contact_submissions`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `message` (text)
      - `status` (text, default 'new')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access where appropriate
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  membership_type text DEFAULT 'basic',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trainers table
CREATE TABLE IF NOT EXISTS trainers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialty text NOT NULL,
  experience text NOT NULL,
  bio text,
  image_url text,
  rating numeric DEFAULT 5.0,
  created_at timestamptz DEFAULT now()
);

-- Create programs table
CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  duration text NOT NULL,
  level text NOT NULL,
  image_url text,
  trainer_id uuid REFERENCES trainers(id),
  max_participants integer DEFAULT 20,
  created_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id uuid REFERENCES programs(id) ON DELETE CASCADE,
  booking_date timestamptz NOT NULL,
  status text DEFAULT 'confirmed',
  created_at timestamptz DEFAULT now()
);

-- Create contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Trainers policies (public read)
CREATE POLICY "Anyone can read trainers"
  ON trainers
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Programs policies (public read)
CREATE POLICY "Anyone can read programs"
  ON programs
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Bookings policies
CREATE POLICY "Users can read own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Contact submissions policies (anyone can insert)
CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Insert sample trainers
INSERT INTO trainers (name, specialty, experience, bio, image_url, rating) VALUES
('Alex Johnson', 'Strength & Conditioning', '8+ years', 'Certified strength coach specializing in powerlifting and functional fitness.', 'https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg?auto=compress&cs=tinysrgb&w=400', 4.9),
('Sarah Chen', 'Yoga & Pilates', '6+ years', 'Experienced yoga instructor focused on mindfulness and flexibility training.', 'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=400', 4.8),
('Mike Rodriguez', 'HIIT & Cardio', '10+ years', 'High-energy trainer specializing in metabolic conditioning and weight loss.', 'https://images.pexels.com/photos/1431283/pexels-photo-1431283.jpeg?auto=compress&cs=tinysrgb&w=400', 4.9);

-- Insert sample programs
INSERT INTO programs (title, description, category, duration, level, image_url, trainer_id) VALUES
('Strength Training', 'Build muscle and increase power with our comprehensive strength programs.', 'strength', '45 min', 'All Levels', 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=800', (SELECT id FROM trainers WHERE name = 'Alex Johnson')),
('HIIT Cardio', 'High-intensity interval training to boost your metabolism and endurance.', 'cardio', '30 min', 'Intermediate', 'https://images.pexels.com/photos/416809/pexels-photo-416809.jpeg?auto=compress&cs=tinysrgb&w=800', (SELECT id FROM trainers WHERE name = 'Mike Rodriguez')),
('Power Yoga', 'Combine flexibility, strength, and mindfulness in our yoga sessions.', 'yoga', '60 min', 'Beginner', 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=800', (SELECT id FROM trainers WHERE name = 'Sarah Chen')),
('CrossFit', 'Functional fitness combining cardio, strength, and flexibility.', 'strength', '50 min', 'Advanced', 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=800', (SELECT id FROM trainers WHERE name = 'Alex Johnson'));

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();