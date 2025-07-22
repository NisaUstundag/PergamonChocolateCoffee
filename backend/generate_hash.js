const bcrypt = require('bcrypt');

// Kullanmak istediğimiz şifre
const plainPassword = 'Pergamon12345';
const saltRounds = 10; // Güvenlik seviyesi

console.log(`'${plainPassword}' şifresi için yeni bir hash oluşturuluyor...`);

// bcrypt.hash fonksiyonu ile şifreyi hash'le
bcrypt.hash(plainPassword, saltRounds, function(err, hash) {
    if (err) {
        console.error("Hash oluşturulurken bir hata oluştu:", err);
        return;
    }

    console.log("\n✅ YENİ HASH BAŞARIYLA OLUŞTURULDU!");
    console.log("Lütfen aşağıdaki hash'in tamamını kopyalayın:\n");
    
    // Oluşturulan yeni ve güvenli hash'i terminale yazdır
    console.log(hash); 
});
