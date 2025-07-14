const path = require('path'); // Node.js'in kendi path modülünü kullanacağız

// .env dosyasının tam yolunu burada belirtiyoruz.
const envPath = path.resolve(__dirname, '.env');

console.log('--- .env Testi Başlatılıyor (Direkt Yol Belirterek) ---');
console.log(`[BİLGİ] .env dosyası şu tam yolda aranacak: ${envPath}`);

// dotenv'e .env dosyasının tam yolunu veriyoruz
const result = require('dotenv').config({ path: envPath });

// dotenv'in bir hata verip vermediğini kontrol edelim
if (result.error) {
    console.error('❌ HATA: dotenv dosyayı yüklerken bir sorunla karşılaştı!');
    throw result.error;
}

console.log('[OK] dotenv.config() komutu başarıyla çalıştırıldı.');
console.log('------------------------------------');

// Okunan değişkenleri yazdır
console.log('Okunan Değişkenler:');
console.log('Veritabanı Sunucusu (DB_HOST):', process.env.DB_HOST);
console.log('Veritabanı Kullanıcısı (DB_USER):', process.env.DB_USER);
console.log('Veritabanı Adı (DB_NAME):', process.env.DB_NAME);
console.log('------------------------------------');

if (!process.env.DB_HOST) {
    console.log('❌ SONUÇ: Dosya yolu manuel olarak belirtilmesine rağmen değişkenler YİNE DE okunamadı!');
    console.log('Bu durum, dosya okuma izinleri veya bir antivirüs programı engellemesi gibi daha derin bir soruna işaret ediyor olabilir.');
} else {
    console.log('✅✅✅ SONUNDA! .env dosyası başarıyla okundu!');
}

console.log('--- Test Tamamlandı ---');