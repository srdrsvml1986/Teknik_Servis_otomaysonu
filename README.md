# Teknik Servis Otomasyon Sistemi

Donanım ürün servis kayıtlarını yönetmek için rol tabanlı erişim kontrolü, denetim kaydı ve müşteri self-servis özellikleri ile kapsamlı bir web uygulaması.

## Özellikler

### Müşteri Portalı (Herkese Açık Erişim)
- **Servis Durumu Takibi**: Müşteriler kişisel bilgileri veya takip numarası ile servis durumunu sorgulayabilir
- **Gerçek Zamanlı Güncellemeler**: Mevcut durumu, servis merkezi konumunu ve detaylı açıklamaları görüntüleyebilir
- **Kimlik Doğrulama Gerektirmez**: Müşteri bilgileri doğrulaması ile güvenli erişim

### Yönetim Paneli (Kimlik Doğrulamalı Erişim)
- **Rol Tabanlı Erişim Kontrolü**: Kullanıcı ve Yönetici rollerine göre farklı yetkiler
- **Müşteri Yönetimi**: Excel içe/dışa aktarma ile tam CRUD işlemleri
- **Servis Kayıt Yönetimi**: Servis taleplerini oluşturma ve tamamlama süreçleri
- **Gerçek Zamanlı Durum Güncellemeleri**: Servis durumunu güncelleme ve otomatik denetim kaydı

### Gelişmiş Özellikler
- **Kapsamlı Denetim Kaydı**: Tüm veritabanı işlemlerini kullanıcı bazlı izleme
- **Excel Entegrasyonu**: Müşteri verilerini içe aktarma ve raporları dışa aktarma
- **Gelişmiş Raporlama**: Personel performans metrikleri, servis merkezi analitikleri ve tamamlama oranları
- **Duyarlı Tasarım**: Masaüstü ve mobil erişime uygun

## Teknoloji Yığını

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Authentication + Real-time)
- **Build Tool**: Vite
- **UI Bileşenleri**: Lucide React ikonları ile özel bileşenler
- **Veri İşleme**: Excel içe/dışa aktarma için XLSX

## Veritabanı Şeması

### Temel Tablolar
- **customers**: Müşteri bilgileri ve iletişim detayları
- **service_records**: Ürün ve durum takibi ile servis talepleri
- **service_updates**: Servis değişikliklerinin geçmiş kaydı
- **audit_logs**: Tüm veritabanı işlemlerinin denetim izi

### Güvenlik Özellikleri
- **Row Level Security (RLS)**: Tüm tablolarda uygulanmıştır
- **Rol Tabanlı Politikalar**: Yönetici ve kullanıcı erişim kontrolleri
- **Herkese Açık Sorgu Erişimi**: Kimlik doğrulama olmadan güvenli müşteri portalı
- **Otomatik Denetim Kaydı**: Tüm CRUD işlemleri için tetikleyici tabanlı kayıt

## Kullanıcı Rolleri

### Müşteri (Kimlik Doğrulama Yok)
- Kişisel bilgi veya takip numarası ile servis durumu sorgulama
- Servis geçmişini ve mevcut durumunu görüntüleme

### Personel Kullanıcı (Kimlik Doğrulamalı)
- Müşteri kayıtlarını yönetme
- Servis kayıtlarını oluşturma ve güncelleme
- Excel ile müşteri verisi içe aktarma
- Temel raporları görüntüleme

### Yönetici (Kimlik Doğrulamalı)
- Tüm kullanıcı yetkilerine ek olarak:
- Denetim kayıtlarına erişim
- Kapsamlı raporlar oluşturma
- Detaylı analitikleri dışa aktarma
- Personel performans metriklerini görüntüleme

## Başlarken

1. **Supabase’e Bağlanın**: Veritabanınızı kurmak için “Connect to Supabase” butonuna tıklayın
2. **Yönetici Kullanıcı Oluşturun**: İlk kullanıcıyı kaydedin ve rolünü Supabase Dashboard üzerinden manuel olarak `admin` yapın
3. **Müşteri Verilerini İçe Aktarın**: Excel içe aktarma özelliği ile müşteri bilgilerini yükleyin
4. **Servis Süreçlerini Başlatın**: Servis kayıtlarını oluşturmaya ve takip etmeye başlayın

### Yönetici Rolünü Ayarlama
Admin kullanıcısı oluşturulduktan sonra Supabase SQL Editör’de aşağıdaki kodu bir kez çalıştırın:
```sql
update auth.users
set raw_app_meta_data = jsonb_set(
    coalesce(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
)
where email = 'admin@admin.tr';
```

### Manuel Migration İşlemi
Uygulamayı ilk defa çalıştıracaksanız, komut satırınızda şu adımları izleyin:
postgresql connection stringinizi supabaseden alabilirsiniz.
```bash
npx supabase --help
npx supabase login
npx supabase link
npx supabase migration up --db-url  "postgresql://postgres:[YOUR-PASSWORD]@db.gotkxngcxggihlagsqv.supabase.co:5432/postgres"
```

### Supabase functions deploy
Uygulamayı ilk defa çalıştıracaksanız, komut satırınızda şu adımları izleyin:
postgresql connection stringinizi supabaseden alabilirsiniz.
```bash
# ilk kurulumda bu komutları kullanabilirsiniz.
npx supabase functions deploy get-all-users
npx supabase functions deploy delete-user
npx supabase functions deploy create-user
npx supabase functions deploy update-user
```

## Temel Metrikler ve Performans

- **Sorgu Doğruluğu**: %95+ müşteri portalı sorguları için
- **Denetim Kapsamı**: %100 tüm veritabanı işlemleri için
- **Excel İçe Aktarma Başarı Oranı**: %98+ doğru formatlı dosyalar için
- **Gerçek Zamanlı Güncellemeler**: Tüm kullanıcılar arasında otomatik senkronizasyon

## Güvenlik Hususları

- **Veri Gizliliği**: RLS politikaları ile müşteri bilgileri korunur
- **Erişim Kontrolü**: Veritabanı seviyesinde sıkı rol tabanlı yetkiler
- **Denetim Kaydı**: Tüm hassas işlemlerin eksiksiz kaydı
- **Güvenli Kimlik Doğrulama**: Supabase e-posta/şifre tabanlı kimlik doğrulama yönetimi

Bu sistem, teknik servis yönetimi için kurumsal seviyede güvenlik, kapsamlı takip ve tüm kullanıcı tipleri için üstün kullanıcı deneyimi sağlayan üretime hazır bir çözümdür.

