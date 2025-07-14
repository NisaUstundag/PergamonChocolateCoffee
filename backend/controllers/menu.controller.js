const db = require('../models/db');

// --- GET: Tüm Menüleri Dile Göre Getir ---
// Örnek istek: /api/menu?lang=tr veya /api/menu?lang=en
exports.getAllMenus = async (req, res) => {
  // 1. Dil parametresini al. Eğer belirtilmemişse veya 'tr' değilse, varsayılan olarak 'tr' kullan.
  const lang = req.query.lang === 'en' ? 'en' : 'tr';

  // 2. Dile göre doğru sütunları seç. Frontend'e hep 'name', 'description' olarak göndereceğiz.
  const nameField = `name_${lang} as name`;
  const descriptionField = `description_${lang} as description`;
  const featuresField = `features_${lang} as features`;

  try {
    // 3. SQL sorgusunu bu dinamik sütunlarla oluştur.
    const sql = `
        SELECT 
            id, 
            ${nameField}, 
            price, 
            image_url, 
            ${descriptionField}, 
            ${featuresField} 
        FROM menu_items
    `;

    const [rows] = await db.query(sql);
    res.json(rows);

  } catch (err) {
    console.error("Menüleri alırken hata:", err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// --- POST: Yeni Menü Öğesi Ekle (Çok Dilli) ---
exports.createMenu = async (req, res) => {
  // 1. İstek body'sinden tüm dil verilerini al.
  const { 
    name_tr, name_en, 
    price, image_url, 
    description_tr, description_en, 
    features_tr, features_en 
  } = req.body;

  // 2. Tüm alanların dolu olduğunu kontrol et (basit bir doğrulama).
  if (!name_tr || !name_en || !price || !image_url) {
    return res.status(400).json({ message: 'Lütfen gerekli alanları doldurun: name_tr, name_en, price, image_url' });
  }

  try {
    // 3. Tüm verileri veritabanına ekle.
    const sql = `
        INSERT INTO menu_items 
        (name_tr, name_en, price, image_url, description_tr, description_en, features_tr, features_en) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      name_tr, name_en, 
      price, image_url, 
      description_tr, description_en, 
      features_tr, features_en
    ]);

    res.status(201).json({ id: result.insertId, message: 'Menü öğesi başarıyla eklendi' });

  } catch (err) {
    console.error("Menü eklerken hata:", err);
    res.status(500).json({ message: 'Veri ekleme hatası' });
  }
};