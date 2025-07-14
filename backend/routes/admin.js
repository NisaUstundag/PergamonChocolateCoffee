const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../models/db'); // db bağlantı dosyan burada

// Admin Giriş (Login)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password);

    if (!match) {
      return res.status(401).json({ success: false, message: 'Hatalı şifre' });
    }

    res.json({ success: true, message: 'Giriş başarılı', admin: { id: admin.id, username: admin.username } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

module.exports = router;
