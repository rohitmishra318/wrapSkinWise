import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const skinType = 'acne'; // later → from profile / quiz result

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const token = localStorage.getItem('token');

        const res = await axios.get(
          `http://localhost:5000/api/blogs?skinType=${skinType}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setBlogs(res.data.blogs);
      } catch (err) {
        setError('Failed to load blogs');
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Loading blogs…</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 mt-10">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 text-slate-800 dark:text-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">

        <h1 className="text-4xl font-extrabold text-center">
          SkinWise Blog — Personalized Reads
        </h1>

         {blogs.length === 0 && (
  <p className="text-center text-gray-500">
    No blogs found for this skin type.
  </p>
)}

        {!selected ? (
          <div className="space-y-6">
            {blogs.map(blog => (
              <div
                key={blog.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm"
              >
                <h2 className="text-2xl font-semibold">{blog.title}</h2>
                <p className="mt-2 text-slate-600 dark:text-gray-300">
                  {blog.excerpt}
                </p>

                <div className="mt-4 flex justify-between items-center">
                  <button
                    onClick={() => setSelected(blog)}
                    className="text-indigo-600 hover:underline"
                  >
                    Read More →
                  </button>

                  <a
                    href={blog.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:underline"
                  >
                    Original Source
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl">
            <button
              onClick={() => setSelected(null)}
              className="text-indigo-500 mb-4 hover:underline"
            >
              ← Back
            </button>

            <h2 className="text-3xl font-bold">{selected.title}</h2>
            <p className="mt-4 text-gray-600">
              Read full article from the original blog.
            </p>

            <a
              href={selected.url}
              target="_blank"
              className="mt-4 inline-block text-indigo-600 hover:underline"
            >
              Open Article →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
