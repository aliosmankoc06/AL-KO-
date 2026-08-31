# Ali Osman Koç — Alan Yönetim Sistemi

Soma Mesleki ve Teknik Anadolu Lisesi, Makine Teknolojisi Alanı için hazırlanan
masaüstü ders programı ve alan yönetim uygulaması. Electron ile geliştirilmiştir;
kurulup çift tıklayarak açılan gerçek bir masaüstü programına dönüştürülebilir.

## Çalıştırma (geliştirme / test amaçlı)

Bilgisayarınızda [Node.js](https://nodejs.org) kurulu olmalı (LTS sürüm yeterli).

```
npm install
npm start
```

## Kurulabilir program (.exe / .AppImage / .dmg) üretmek

```
npm run dist
```

Bu komut, işletim sisteminize uygun bir kurulum dosyasını `dist/` klasörüne üretir
(Windows'ta `.exe`, macOS'ta `.dmg`, Linux'ta `.AppImage`). Bu dosyayı doğrudan
başka bir bilgisayara kopyalayıp kurabilirsiniz — Node.js gerekmez.

## Klasör yapısı

- `electron/` — masaüstü uygulama kabuğu (pencere, menü, dosya kaydetme/açma)
- `src/index.html` — arayüz iskeleti
- `src/css/app.css` — tasarım
- `src/js/model.js` — veri modeli (öğretmen, sınıf, ders, işletme… veri yapıları)
- `src/js/scheduler.js` — **ders/koordinatörlük dağıtım motoru** (kuralların uygulandığı yer)
- `src/js/views.js` — ekranlar ve kullanıcı etkileşimleri
- `src/js/icons.js` — arayüz ikonları

## Kural kaynağı: Koordinatörlük (işletme ziyareti) saat hesabı

Millî Eğitim Bakanlığı Ortaöğretim Kurumları Yönetmeliği, **Madde 88**
(Koordinatör öğretmen görevlendirilmesi): *"Bir öğretmene aynı gün için 8 saatten
fazla ek ders görevi verilmez."*

Bu nedenle `src/js/scheduler.js` içinde bir öğretmene koordinatörlük (işletme
ziyareti) günü verildiğinde o günün **tamamı** o öğretmen için bloklanır (aynı
gün başka okul dersi eklenmez), ama sadece ortadaki 8 saati ücretli (`paid`)
sayılır. Normal okul dersleri ise günlük 10 ders saati (40 dk) üzerinden
hesaplanmaya devam eder — bu ayrım kodda `KOORD_START_HOUR` / `KOORD_BLOCK_LEN`
sabitleriyle ve ilgili yorum satırlarıyla belirtilmiştir.

> Not: Ek ders ücreti hesaplamasına dair diğer ayrıntılar (haftalık ders yükü,
> muafiyetler vb.) için resmî tebliğ/yönetmelik metinleri elinizde varsa
> paylaşmanız, kuralları daha da kesinleştirmemizi sağlar.

## Veri güvenliği

Program verileriniz (ders havuzu, öğretmenler, sınıflar, dağıtım) bilgisayarınızda
saklanır. **Dosya → Verilerimi Dışa Aktar (Yedek Al)** ile düzenli olarak yedek
almanız, bilgisayar değişikliğinde veya bir sorun durumunda veri kaybını önler.
