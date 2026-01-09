const express = require('express');
const axios = require('axios');

const router = express.Router();

/**
 * GET /api/blogs?search=acne
 * GET /api/blogs        -> default skincare blogs
 */
router.get('/', async (req, res) => {
  try {
    const searchQuery = req.query.search || 'skincare';

    const response = await axios.get(
      'https://api.twingly.com/blog/search/api/v3/search',
      {
        params: {
          apikey: process.env.TWINGLY_API_KEY,
          q: searchQuery,
          format: 'json',
          max: 10,              // 🔥 ONLY 10 blogs
          sort: 'published'     // latest first
        },
        timeout: 8000           // prevent long hangs
      }
    );

    const posts =
      response.data?.posts ||
      response.data?.documents ||
      [];

    console.log("Blog posts fetched:", posts);

    const blogs = posts.slice(0, 10).map((post, index) => ({
      id: post.id || index,
      title: post.title || 'Untitled',
      excerpt: post.text
        ? post.text.slice(0, 160) + '...'
        : 'Read full article',
      url: post.url,
      publishedAt: post.published
    }));

    res.json({ blogs });

  } catch (err) {
    console.error('Blog fetch error:', err.message);
    res.status(500).json({ message: 'Failed to fetch blogs' });
  }
});

module.exports = router;
