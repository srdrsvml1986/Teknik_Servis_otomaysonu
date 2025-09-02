/*
  # Kullanıcı Profilleri Tablosu

  1. Yeni Tablolar
    - `profiles`
      - `id` (uuid, primary key, auth.users ile bağlantılı)
      - `first_name` (text, ad)
      - `last_name` (text, soyad)
      - `phone` (text, telefon)
      - `address` (text, adres)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Güvenlik
    - RLS etkin
    - Kullanıcılar sadece kendi profillerini okuyabilir ve güncelleyebilir
    - Profil oluşturma için trigger fonksiyonu

  3. Özellikler
    - Yeni kullanıcı kaydında otomatik profil oluşturma
    - Güncelleme zamanı otomatik takibi
*/

-- Profiles tablosunu oluştur
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  phone text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS'yi etkinleştir
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi profillerini görebilir
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Kullanıcılar sadece kendi profillerini güncelleyebilir
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Kullanıcılar kendi profillerini oluşturabilir
CREATE POLICY "Users can create own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Updated_at otomatik güncelleme trigger'ı
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Yeni kullanıcı kaydında otomatik profil oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, first_name, last_name)
  VALUES (NEW.id, '', '');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Yeni kullanıcı kaydında otomatik profil oluşturma trigger'ı
CREATE TRIGGER create_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_new_user();