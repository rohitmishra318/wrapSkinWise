const express = require('express');
const axios = require('axios');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const skinType = req.query.skinType || 'skincare';

    console.log('Fetching blogs for:', skinType);
    console.log('API KEY:', process.env.TWINGLY_API_KEY);

    const response = await axios.get(
      'https://api.twingly.com/blog/search/api/v3/search',
      {
        params: {
          apikey: process.env.TWINGLY_API_KEY,
          q: `${skinType} OR skincare`,
          format: 'json',
          max: 10
        }
      }
    );

    console.log('RAW RESPONSE:', response.data);

    const posts =
      response.data?.posts ||
      response.data?.documents ||
      [];

    const blogs = posts.map((post, index) => ({
      id: post.id || index,
      title: post.title,
      excerpt: post.text
        ? post.text.slice(0, 180) + '...'
        : 'Read full article',
      url: post.url,
      publishedAt: post.published
    }));

    res.json({ blogs });

  } catch (err) {
    console.error(
      'Twingly error:',
      err.response?.data || err.message
    );
    res.status(500).json({ message: 'Blog fetch failed' });
  }
});

module.exports = router;
