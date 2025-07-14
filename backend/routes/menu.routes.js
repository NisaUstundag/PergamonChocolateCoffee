const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');

router.get('/', menuController.getAllMenus);
router.post('/', menuController.createMenu);

module.exports = router;
