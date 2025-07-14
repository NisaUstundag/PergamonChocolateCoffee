const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise'); // Veritabanı kütüphanesini direkt burada çağırıyoruz

// --- GEÇİCİ TEST: .env dosyasını atlayıp bilgileri direkt yazıyoruz ---
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', // EĞER MySQL root şifreniz varsa buraya yazın, yoksa boş bırakın.
    database: 'pergamon'
};
// ----------------------------------------------------------------------

const saltRounds = 10;
const adminUsername = 'admin';
const adminPassword = 'GucluSifre123!';

async function createAdmin() {
    let db; // Veritabanı bağlantısını burada tanımla
    try {
        console.log('Veritabanına bağlanılıyor (direkt bilgilerle)...');
        // Bağlantıyı direkt bilgilerle oluştur
        db = await mysql.createPool(dbConfig);
        console.log('Veritabanı havuzu oluşturuldu.');

        console.log(`'${adminUsername}' kullanıcısı oluşturuluyor...`);

        const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
        console.log('Şifre başarıyla hash\'lendi.');

        const [result] = await db.query(
            'INSERT INTO admins (username, password) VALUES (?, ?)',
            [adminUsername, hashedPassword]
        );
        
        console.log('✅✅✅ Admin kullanıcısı başarıyla oluşturuldu! ID:', result.insertId);
        console.log('Sorun .env dosyasının okunmasındaymış. Şimdi diğer dosyaları düzenleyebiliriz.');

    } catch (error) {
        console.error('❌ Admin oluşturulurken bir hata oluştu:');
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
             console.error("HATA SEBEBİ: Erişim reddedildi. Lütfen yukarıdaki 'dbConfig' içindeki 'user' ve 'password' bilgilerinin doğru olduğundan emin olun.");
        } else if (error.code === 'ECONNREFUSED') {
             console.error("HATA SEBEBİ: Bağlantı kurulamadı. XAMPP'de MySQL'in çalıştığından emin olun.");
        } else if (error.code === 'ER_BAD_DB_ERROR') {
             console.error(`HATA SEBEBİ: '${dbConfig.database}' adında bir veritabanı bulunamadı.`);
        } else if (error.code === 'ER_DUP_ENTRY') {
            console.error('HATA SEBEBİ: Bu kullanıcı adı zaten mevcut!');
        } else {
            console.error('Beklenmedik Hata Detayı:', error);
        }
    } finally {
        if (db) {
            await db.end(); // Havuzu kapat
            console.log('Veritabanı bağlantısı kapatıldı.');
        }
    }
}

createAdmin();