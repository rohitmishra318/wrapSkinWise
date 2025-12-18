// components/AdminStatCard.jsx
export default function AdminStatCard({ title, value, subtitle }) {
  return (
    <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {subtitle && (
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
