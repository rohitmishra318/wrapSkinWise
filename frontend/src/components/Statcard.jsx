export default function StatCard({ title, value, sub, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 border rounded-lg p-4">
      <div className="text-sm text-gray-500">{title}</div>

      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {value}
      </div>

      {sub && (
        <div className="text-xs text-gray-500 mt-1">
          {sub}
        </div>
      )}

      {/* 🔥 THIS WAS MISSING */}
      {children && (
        <div className="mt-2">
          {children}
        </div>
      )}
    </div>
  );
}
