const StatCard = ({ title, value, sub }) => (
  <div className="p-4 rounded-lg border bg-white dark:bg-gray-800">
    <div className="text-sm text-gray-500">{title}</div>

    <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
      {value}
    </div>

    {sub && (
      <div className="text-xs text-gray-500 mt-1">
        {sub}
      </div>
    )}
  </div>
);
export default StatCard;