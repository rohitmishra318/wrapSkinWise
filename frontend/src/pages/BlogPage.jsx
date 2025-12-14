import React, { useState } from 'react';

const posts = [
  {
    id: 1,
    title: "The Perfect Acne-Prone Skin Routine",
    excerpt:
      "Effective acne care starts with cleansing, gentle hydration, active treatment, and SPF protection.",
    content: (
      <>
        <p>
          A proven acne routine begins with twice-daily cleansing using a mild cleanser
          to remove oil and bacteria. This should be followed by hydration using
          hyaluronic acid to support the skin barrier.
        </p>
        <p>
          Targeted treatments such as niacinamide or salicylic acid can be applied
          directly on breakouts. Always seal your routine with a moisturizer and
          apply sunscreen every morning to prevent dark acne marks.
        </p>
      </>
    ),
  },
  {
    id: 2,
    title: "Science-Backed Skincare Routines",
    excerpt:
      "Build a daily routine that improves barrier health, brightness, and hydration.",
    content: (
      <>
        <p>
          Dermatologists recommend cleansing to remove pollution and debris so that
          serums and moisturizers absorb effectively into the skin.
        </p>
        <p>
          Consistent use of vitamin C in the morning and sunscreen helps prevent
          pigmentation, premature aging, and dullness.
        </p>
      </>
    ),
  },
  {
    id: 3,
    title: "Pigmentation Care & Tips",
    excerpt:
      "Understand how pigmentation forms and how gentle exfoliation can improve tone.",
    content: (
      <>
        <p>
          Pigmentation occurs when melanin clusters in specific areas such as acne
          scars or sun spots. Gentle exfoliation using AHAs like glycolic acid helps
          remove dead skin layers.
        </p>
        <p>
          Double cleansing — oil cleanser followed by a water-based cleanser —
          ensures sunscreen and makeup are completely removed, improving treatment
          effectiveness.
        </p>
      </>
    ),
  },
  {
    id: 4,
    title: "Eat for Healthy Skin",
    excerpt:
      "Nutrition plays a vital role in hydration, glow, and skin repair.",
    content: (
      <>
        <p>
          Vitamin C–rich fruits such as oranges, strawberries, and apples help boost
          collagen production and strengthen antioxidant protection.
        </p>
        <p>
          Drinking enough water and eating antioxidant-rich foods reduces inflammation
          and supports faster skin healing.
        </p>
      </>
    ),
  },
];

export default function BlogPage() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 text-slate-800 dark:text-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">

        <h1 className="text-4xl font-extrabold text-center">
          SkinWise Blog — Tips & Science
        </h1>

        {!selected ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition"
              >
                <h2 className="text-2xl font-semibold">{post.title}</h2>
                <p className="mt-2 text-slate-600 dark:text-gray-300">
                  {post.excerpt}
                </p>
                <button
                  onClick={() => setSelected(post)}
                  className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                >
                  Read More →
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <button
              onClick={() => setSelected(null)}
              className="text-sm text-indigo-500 hover:underline mb-4"
            >
              ← Back to Posts
            </button>
            <h2 className="text-3xl font-bold mb-4">{selected.title}</h2>
            <div className="space-y-4 text-slate-700 dark:text-gray-300">
              {selected.content}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
