export const MetricCard = ({ title, value, subtitle, trend, icon: Icon, color = 'blue' }) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-600',
      border: 'border-blue-100',
      text: 'text-blue-600',
    },
    emerald: {
      bg: 'bg-emerald-50',
      iconBg: 'bg-emerald-600',
      border: 'border-emerald-100',
      text: 'text-emerald-600',
    },
    amber: {
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-600',
      border: 'border-amber-100',
      text: 'text-amber-600',
    },
    rose: {
      bg: 'bg-rose-50',
      iconBg: 'bg-rose-600',
      border: 'border-rose-100',
      text: 'text-rose-600',
    },
    indigo: {
      bg: 'bg-indigo-50',
      iconBg: 'bg-indigo-600',
      border: 'border-indigo-100',
      text: 'text-indigo-600',
    },
  };

  const currentTheme = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${currentTheme.bg} ${currentTheme.text}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend.isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-slate-500 mt-2 font-medium">{subtitle}</p>}
    </div>
  );
};

export default MetricCard;
