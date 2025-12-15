import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBlogs = async (query = '') => {
    try {
      setLoading(true);
      setError('');

      const res = await axios.get(
        `http://localhost:5000/api/blogs`,
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

  // Load default blogs on page load
  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBlogs(search);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 text-slate-800 dark:text-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">

        <h1 className="text-4xl font-extrabold text-center">
          SkinWise Blog — Skincare Reads
        </h1>

        {/* 🔍 SEARCH BAR */}
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

        {/* STATES */}
        {loading && <p className="text-center">Loading blogs...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {/* BLOG LIST */}
        {!loading && blogs.length === 0 && (
          <p className="text-center text-gray-500">
            No blogs found for this topic.
          </p>
        )}

        <div className="space-y-6">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition"
            >
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
          ))}
        </div>

      </div>
    </div>
  );
}
