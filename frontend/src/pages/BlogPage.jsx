// frontend/src/pages/BlogPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';
import SEO from '../components/SEO.jsx';
/* -------------------------------------------
   Helper: Decide image based on content
-------------------------------------------- */
function getBlogImage(query, title) {
  const q = `${query} ${title}`.toLowerCase();

  if (q.includes('acne')) return '/images/blogs/acne.jpg';
  if (q.includes('wrinkle')) return '/images/blogs/wrinkles.jpg';
  if (q.includes('pigment')) return '/images/blogs/pigmentation.jpg';
  if (q.includes('blackhead')) return '/images/blogs/blackheads.jpg';
  if (q.includes('dry')) return '/images/blogs/dry-skin.jpg';
  if (q.includes('oily')) return '/images/blogs/oily-skin.webp';
  if (q.includes('sunscreen') || q.includes('spf'))
    return '/images/blogs/sunscreen.jpg';

  return '/images/blogs/skincare.jpg'; // fallback
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* -------------------------------------------
     Fetch blogs from backend
  -------------------------------------------- */
  const fetchBlogs = async (query = '') => {
    try {
      setLoading(true);
      setError('');

      const res = await axios.get(
        'http://localhost:5000/api/blogs',
        {
          params: { search: query || 'skincare' }
        }
      );

      setBlogs(res.data.blogs || []);
    } catch (err) {
      setError('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  /* Load default blogs on mount */
  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBlogs(search);
  };

  return (
      
    <><SEO title="Blog" description="Read the latest skincare articles and advice." />

    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 text-slate-800 dark:text-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">

        {/* ---------------- HEADER ---------------- */}
        <h1 className="text-4xl font-extrabold text-center">
          SkinWise Blog — Skincare Reads
        </h1>

        {/* ---------------- SEARCH ---------------- */}
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-2 max-w-xl mx-auto"
        >
          <input
            type="text"
            placeholder="Search skincare topics (acne, routine, sunscreen...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg flex items-center gap-2"
          >
            <Search size={18} />
            Search
          </button>
        </form>

        {/* ---------------- STATES ---------------- */}
        {loading && <p className="text-center">Loading blogs...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && blogs.length === 0 && (
          <p className="text-center text-gray-500">
            No blogs found for this topic.
          </p>
        )}

        {/* ---------------- BLOG LIST ---------------- */}
        <div className="space-y-8">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition overflow-hidden"
            >
              {/* Blog Image */}
              <img
                src={getBlogImage(blog.excerpt, blog.title)}
                alt={blog.title}
                className="w-full h-48 object-cover"
              />

              {/* Blog Content */}
              <div className="p-6">
                <h2 className="text-2xl font-semibold">
                  {blog.title}
                </h2>

                <p className="mt-2 text-slate-600 dark:text-gray-300">
                  {blog.excerpt}
                </p>

                <a
                  href={blog.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                >
                  Read Full Article →
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
   </>
  );
}
