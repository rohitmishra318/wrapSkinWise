const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer(); // memory storage

router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  async (req, res) => {
    try {
      console.log('Received file:', req.file);

      if (!req.file) {
        return res.status(400).json({ message: 'Image file is required' });
      }

      const form = new FormData();

      form.append('image', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      const response = await axios.post(
        'http://localhost:7000/analyze-image',
        form,
        {
          headers: {
            ...form.getHeaders(),
          },
          timeout: 60000,
        }
      );

      res.json(response.data);
    } catch (err) {
      console.error('Analyze error:', err.message);
      res.status(500).json({ message: 'Skin analysis failed' });
    }
  }
);

module.exports = router;
