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
