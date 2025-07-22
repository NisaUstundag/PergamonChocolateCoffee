const bcrypt = require('bcrypt');

// Doğrulamak istediğimiz şifre ve SQL kodundaki hash
const plainPassword = 'Pergamon12345';
const hashedPassword = '$2b$10$E.o9qA.Yut1313S.qgII5eY.p7k/C.X.iK.a.f.d.e.f.g.h';

console.log("Şifre ve hash karşılaştırılıyor...");

// bcrypt.compare fonksiyonu ile karşılaştırma yap
bcrypt.compare(plainPassword, hashedPassword, function(err, result) {
    if (err) {
        console.error("Karşılaştırma sırasında bir hata oluştu:", err);
        return;
    }

    if (result) {
        console.log("\n✅ DOĞRULANDI! Şifreler eşleşiyor.");
    } else {
        console.log("\n❌ HATA! Şifreler eşleşmiyor.");
    }
});