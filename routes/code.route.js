const express = require('express');
const router = express.Router();
const codemiddle = require('../middlewares/code.middleware.js');
const {createCodes , buyCode} = require('../controllers/code.controller.js');

// route create codes
router.post('/api/wallet',codemiddle,createCodes)

// route buy code
router.post('/api/code',buyCode)

module.exports = router