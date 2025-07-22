const express = require("express");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const path = require("path");
const multer = require("multer");

// .env dosyasını yükle
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Temel Middleware'ler
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'"],
        "frame-src": ["'self'", "https://www.google.com/"], // Google Harita için
      },
    },
  })
);
app.use(express.json());

// Statik Klasörler
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Resim Yükleme (Multer) Ayarları
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'))
});
const upload = multer({ storage: storage });

// Veritabanı Bağlantısı
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// --- GÜVENLİK ve OTURUM YÖNETİMİ ---

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET_KEY || 'gizli', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        // DÜZELTME: 'admins' yerine 'admin_users' tablosunu sorgula
        const [rows] = await pool.query('SELECT * FROM admin_users WHERE username = ?', [username]);
        if (rows.length === 0) return res.status(401).json({ success: false, message: 'Kullanıcı adı veya şifre hatalı!' });
        
        const admin = rows[0];
        // DÜZELTME: 'admin.password' yerine 'admin.password_hash' ile karşılaştır
        const isPasswordMatch = await bcrypt.compare(password, admin.password_hash);
        if (!isPasswordMatch) return res.status(401).json({ success: false, message: 'Kullanıcı adı veya şifre hatalı!' });

        const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET_KEY || 'gizli', { expiresIn: '8h' });
        res.status(200).json({ success: true, token: token });
    } catch (error) {
        console.error("🔴 Login hatası:", error);
        res.status(500).json({ success: false, message: 'Sunucuda bir hata oluştu.' });
    }
});


// --- MENÜ API ENDPOINT'LERİ ---

// GET (Tümü, dile göre)
app.get("/api/menu", async (req, res) => {
    const lang = req.query.lang;
    if (lang === 'tr' || lang === 'en') {
        const nameField = `name_${lang} as name`;
        const descriptionField = `description_${lang} as description`;
        const featuresField = `features_${lang} as features`;
        const sql = `SELECT id, ${nameField}, price, image_url, ${descriptionField}, ${featuresField} FROM menu_items ORDER BY id DESC`;
        try {
            const [rows] = await pool.query(sql);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: "Menü alınamadı" });
        }
    } else {
        try {
            const [rows] = await pool.query('SELECT * FROM menu_items ORDER BY id DESC');
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: "Menü alınamadı" });
        }
    }
});

// GET (Tekil, düzenleme için)
app.get("/api/menu/:id", async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM menu_items WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Öğe bulunamadı." });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Öğe alınamadı" });
    }
});

// POST (Yeni öğe ekle)
app.post("/api/menu", verifyToken, upload.single('image_file'), async (req, res) => {
    const { name_tr, name_en, price, description_tr, description_en, features_tr, features_en } = req.body;
    if (!req.file) return res.status(400).json({ error: "Lütfen bir resim dosyası seçin." });
    const image_url = `/uploads/${req.file.filename}`;
    try {
        await pool.execute(`INSERT INTO menu_items (name_tr, name_en, price, image_url, description_tr, description_en, features_tr, features_en) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [name_tr, name_en, price, image_url, description_tr, description_en, features_tr, features_en]);
        res.status(201).json({ message: "Menü öğesi eklendi ✅" });
    } catch (err) {
        res.status(500).json({ error: "Veritabanına eklenirken hata oluştu." });
    }
});

// PUT (Öğe güncelle)
app.put("/api/menu/:id", verifyToken, upload.single('image_file'), async (req, res) => {
    const { id } = req.params;
    const { name_tr, name_en, price, existing_image_url, description_tr, description_en, features_tr, features_en } = req.body;
    let image_url = existing_image_url;
    if (req.file) {
        image_url = `/uploads/${req.file.filename}`;
    }
    try {
        const [result] = await pool.execute(`UPDATE menu_items SET name_tr = ?, name_en = ?, price = ?, image_url = ?, description_tr = ?, description_en = ?, features_tr = ?, features_en = ? WHERE id = ?`, [name_tr, name_en, price, image_url, description_tr, description_en, features_tr, features_en, id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Güncellenecek öğe bulunamadı." });
        res.status(200).json({ message: "Menü öğesi başarıyla güncellendi." });
    } catch (err) {
        res.status(500).json({ error: "Öğe güncellenirken bir hata oluştu." });
    }
});

// DELETE (Öğe sil)
app.delete("/api/menu/:id", verifyToken, async (req, res) => {
    try {
        const [result] = await pool.execute('DELETE FROM menu_items WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Silinecek öğe bulunamadı." });
        res.status(200).json({ message: "Menü öğesi başarıyla silindi." });
    } catch (err) {
        res.status(500).json({ error: "Öğe silinirken bir hata oluştu." });
    }
});


// --- SUNUCUYU BAŞLATMA ---
app.listen(port, () => {
  console.log(`✅ Server çalışıyor: http://localhost:${port}`);
  console.log(`🔑 Admin girişi için: http://localhost:${port}/login.html`);
  console.log(`🍽️ Türkçe Menü için: http://localhost:${port}/menu.html`);
});
