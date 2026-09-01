/* ============================================================
   MÜFREDAT VERİSİ (Yıllık Plan / Günlük Plan için kaynak)
   ------------------------------------------------------------
   Kaynak: MEB çerçeve öğretim programları (bkz. curriculum/*.json).
   İki ayrı sistem var çünkü MEB 2025-2026'da müfredat reformuna
   sadece 9. sınıftan başladı (Türkiye Yüzyılı Maarif Modeli).
   Bu yılki 10-12. sınıflar hâlâ eski (reform öncesi) çerçeve
   programa tabi. Dal dallar tamamen Maarif Modeline geçtiğinde
   "eski" anahtarı ve ilgili arayüz "Eski Sistemi Kaldır" butonuyla
   devre dışı bırakılabilir (bkz. S.eskiSistemKaldirildi).
   ============================================================ */

const CURRICULUM = {
  maarif: {
    label: "Maarif Model (2026)",
    grades: {
      9: {
        dal: "ALAN ORTAK",
        dersler: [
          {
            ad: "Temel İmalat İşlemleri", saat: 8,
            ogrenmeBirimleri: [
              "İş Sağlığı ve Güvenliği", "Ölçme ve Kontrol", "El İşlemleri", "Malzeme Bilgisi",
              "Delme Operasyonları", "Vida Açma İşlemleri", "Temel Tornalama İşlemleri", "Temel Frezeleme İşlemleri"
            ]
          },
          {
            ad: "Teknik Resim", saat: 2,
            ogrenmeBirimleri: [
              "Teknik Resim Temel Kavramları", "Geometrik Çizimler", "Görünüş Çıkarma ve Kesit Görünüşler",
              "Ölçülendirme, Yüzey İşlemleri ve Tolerans", "Kroki, Perspektif ve Yapım Resmi"
            ]
          },
          { ad: "Mesleki Gelişim Atölyesi", saat: 2, ogrenmeBirimleri: [] }
        ]
      },
      10: {
        dal: "MAKİNE BAKIM ONARIM / BİLGİSAYARLI MAKİNE İMALATI",
        dersler: [
          {
            ad: "İmalat Yöntemleri (MBO)", saat: 6,
            ogrenmeBirimleri: [
              "Torna Tezgâhında Delik Büyütme İşlemleri", "Torna Tezgâhında Vida Açma", "Özel Frezeleme İşlemleri",
              "Frezede Dişli Açma", "Temel Taşlama İşlemleri", "Elektrik Arkı ile Dikiş Çekme", "Oksi-Gaz ile Dikiş Çekme"
            ]
          },
          {
            ad: "İmalat İşlemleri (BMİ)", saat: 8,
            ogrenmeBirimleri: [
              "İleri Ölçme ve Kontrol", "İleri Malzeme Bilgisi", "Torna Tezgâhında Delme İşlemleri",
              "Torna Tezgâhında Vida Açma İşlemleri", "Özel Tornalama İşlemleri", "Freze Tezgâhında Özel Bağlama Yöntemleri",
              "Freze Tezgâhında Bölme İşlemleri", "Özel Frezeleme İşlemleri", "Taşlama İşlemleri", "Alet Bileme İşlemleri"
            ]
          },
          {
            ad: "Makine Meslek Resmi", saat: 3,
            ogrenmeBirimleri: [
              "Vidalı Bağlantı Elemanları Çizimi", "Emniyetli Bağlama Elemanları Çizimi", "Birleştirme Elemanları Çizimi",
              "Geometrik Boyutlandırma ve Toleranslar", "Makine Elemanları Çizimi", "Detay ve Komple Resimleri Çizimi",
              "Açınımlar ve Arakesitler"
            ]
          },
          {
            ad: "Ölçme ve Kontrol (MBO)", saat: 2,
            ogrenmeBirimleri: [
              "Kumpas ile Ölçme", "Mikrometre ile Ölçme", "Dişli Çark Kontrolü", "Salgı ve Form Kontrolü",
              "Açısal Ölçme ve Kontrol", "Toleranslı Ölçüm ve Uygunluk", "Arıza Tespiti ve Raporlama"
            ]
          },
          {
            ad: "Malzeme Bilgisi (MBO)", saat: 2,
            ogrenmeBirimleri: [
              "Malzeme Bilimi", "Demir Üretimi", "Çelik Üretimi", "Çeliklerin Isı İşlemleri", "Korozyon",
              "Demir Dışı Malzemeler", "Malzeme Muayene Yöntemleri", "Toz Metalürjisi"
            ]
          },
          {
            ad: "Bilgisayar Destekli Çizim (BMİ)", saat: 2,
            ogrenmeBirimleri: [
              "Bilgisayar Destekli Çizime Giriş", "İki Boyutlu Çizim ve Düzenleme İşlemleri", "Nesne Özellikleri ve Katmanlar",
              "Çizim Detaylandırma", "Blok İşlemleri ve Çıktı Alma", "İzometrik Çizim"
            ]
          }
        ]
      },
      11: {
        dal: "MAKİNE BAKIM ONARIM / BİLGİSAYARLI MAKİNE İMALATI",
        dersler: [
          {
            ad: "Mekanik Bakım Onarım (MBO)", saat: 9,
            ogrenmeBirimleri: [
              "Makine Yerleşim Planı", "Makine Kurma İşlemleri", "Makinelerin Düzenli Bakımı",
              "Sistemlerin Düzenli Kontrolü", "Kaldırma ve Taşıma Araçları", "Arıza Tespiti", "Arızalı Makinenin Onarımı"
            ]
          },
          {
            ad: "Hidrolik-Pnömatik Sistemlerde Bakım Onarım (MBO)", saat: 4,
            ogrenmeBirimleri: [
              "Hidrolik Devre Elemanları", "Hidrolik Devrelerde Bakım Planı", "Hidrolik Devre Elemanları Bakım ve Onarımı",
              "Pnömatik Devre Elemanları", "Pnömatik Devrelerde Bakım Planı"
            ]
          },
          { ad: "Mekanizmalar (MBO)", saat: 2, ogrenmeBirimleri: ["Mekanizma Bağlantı Elemanları", "Mekanizma Aktarım Elemanları"] },
          {
            ad: "Temel Elektrik (MBO)", saat: 2,
            ogrenmeBirimleri: [
              "Elektrik Atölyesi Güvenlik Kuralları", "Elektriksel Ölçmeler", "Elektrik Devre Koruyucuları",
              "Temel Elektrik Devreleri", "Elektrik Enerjisi Tasarrufu"
            ]
          },
          {
            ad: "Bilgisayar Kontrollü Tezgâhlarda Üretim (CNC) (BMİ)", saat: 10,
            ogrenmeBirimleri: [
              "CNC Torna Tezgâhını Üretime Hazırlama", "CNC Torna Tezgâhında Programlama", "CNC Tornalama Çevrimleri",
              "CNC Tornada Alt Programlama", "CNC Freze Tezgâhını Üretime Hazırlama", "CNC Freze Tezgâhında Programlama",
              "CNC Frezeleme Çevrimleri", "CNC Frezeleme Alt Programlama"
            ]
          },
          {
            ad: "Bilgisayar Destekli Tasarım ve Üretim (CAD/CAM) (BMİ)", saat: 4,
            ogrenmeBirimleri: [
              "İki Boyutlu Çizimler", "Katı ve Yüzey Modelleme", "Katıların Montajı", "Katıların Teknik Resmini Alma",
              "CAM ile Tornalama", "CAM ile Frezeleme"
            ]
          },
          {
            ad: "Endüstriyel Ürün Geliştirme (BMİ)", saat: 3,
            ogrenmeBirimleri: ["AR-GE", "3B Tarama", "3B Yazdırma", "İleri İmalat Teknikleri", "Ürün Doğrulama"]
          }
        ]
      },
      12: {
        dal: "MAKİNE BAKIM ONARIM / BİLGİSAYARLI MAKİNE İMALATI",
        not: "12. sınıf tamamen İşletmelerde Mesleki Eğitim (staj, 24 saat) — okulda ayrı ders/öğrenme birimi yok, koordinatörlük sistemiyle karşılanıyor.",
        dersler: []
      }
    }
  },
  eski: {
    label: "Eski Sistem (Reform Öncesi)",
    grades: {
      10: {
        dal: "MAKİNE BAKIM ONARIM",
        dersler: [
          {
            ad: "İmalat Yöntemleri", saat: 6,
            ogrenmeBirimleri: [
              "Torna Tezgâhında Delme ve Delik Büyütme", "Torna Tezgâhında Vida Açma",
              "Frezede Delme ve Kama Kanalı Açma", "Frezede Dişli Açma", "Temel Taşlama İşlemleri",
              "Elektrik Arkı İle Dikiş Çekme", "Oksi-Gaz İle Dikiş Çekme"
            ]
          },
          {
            ad: "Bakım Onarım Meslek Resmi", saat: 3,
            ogrenmeBirimleri: [
              "Vida, Cıvata ve Somun Resimlerinin Çizimi", "Emniyetli Bağlama Elemanları Çizimi",
              "Birleştirme Resimleri Çizimi", "Makine Elemanları Resmi Çizimi", "Komple Resimler"
            ]
          },
          {
            ad: "Ölçme ve Kontrol", saat: 2,
            ogrenmeBirimleri: [
              "Kumpasla Ölçüm Yapma", "Mikrometre Ölçüm Yapma", "Açı Ölçme", "Yüzey Pürüzlülüğü Ölçme",
              "Vidaları Ölçme", "Dişli Çarkları Ölçme", "Mastarlar ve Optik Camlarla Yüzey Kontrolü Yapma",
              "Şekil Tolerans Kontrolü Yapma", "Boyut Tolerans Kontrolü Yapma"
            ]
          },
          {
            ad: "Malzeme Bilgisi", saat: 2,
            ogrenmeBirimleri: [
              "Malzeme Bilimi", "Demir Üretimi", "Çelik Üretimi", "Çeliklerin Isıl İşlemleri",
              "Korozyon", "Demir Dışı Malzemeler", "Malzeme Muayene Yöntemleri", "Toz Metalürjisi"
            ]
          }
        ]
      },
      11: {
        dal: "MAKİNE BAKIM ONARIM",
        dersler: [
          {
            ad: "Mekanik Bakım Onarım", saat: 6,
            ogrenmeBirimleri: [
              "Makine Yerleşim Planı", "Makine Kurma İşlemleri", "Makinelerin Düzenli Bakımı",
              "Sistemlerin Düzenli Kontrolleri", "Kaldırma ve Taşıma Araçları", "Arıza Tespiti", "Arızalı Makinenin Onarımı"
            ]
          },
          { ad: "Otomatik Kontrol Sistemleri", saat: 6, ogrenmeBirimleri: [
              "Hidrolik Devre Elemanları", "Hidrolik Devrelerde Bakım Planı", "Hidrolik Devre Elemanları Bakım ve Onarımı",
              "Pnömatik Devre Elemanları", "Pnömatik Devrelerde Bakım Planı"
            ]
          },
          { ad: "Mekanizmalar", saat: 3, ogrenmeBirimleri: ["Basit Mekanizmalar", "Mekanizmalarda Aktarma Elemanları"] },
          { ad: "Temel Elektrik", saat: 2, ogrenmeBirimleri: ["İletkenleri Bağlantıya Hazırlama", "İletkenleri Ekleme ve Bağlama", "Elektrik Devresi Kurma ve Faz Kontrolü"] }
        ]
      },
      12: {
        dal: "MAKİNE BAKIM ONARIM / BİLGİSAYARLI MAKİNE İMALATI",
        not: "12. sınıf tamamen İşletmelerde Mesleki Eğitim (staj, 24 saat) — okulda ayrı ders/öğrenme birimi yok, koordinatörlük sistemiyle karşılanıyor.",
        dersler: []
      }
    }
  }
};
