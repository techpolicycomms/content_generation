import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

/**
 * Material recovery rate chart.
 * Shows breakdown of collected materials as a horizontal bar chart.
 * For production, integrate with Recharts or Chart.js for interactive visualisations.
 */
export default function ReturnRateChart() {
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    api.get('/reports/impact')
      .then(res => {
        const c = res.data.collection;
        setData([
          { label: 'Lanyards', value: c.totalLanyards, color: '#22c55e' },
          { label: 'Plastic', value: c.totalPlastic, color: '#3b82f6' },
          { label: 'Metal', value: c.totalMetal, color: '#a855f7' },
          { label: 'Glass', value: c.totalGlass, color: '#f59e0b' },
          { label: 'Other', value: c.totalOther, color: '#6b7280' },
        ]);
      })
      .catch(() => {});
  }, []);

  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-sm text-gray-600 w-20">{item.label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
          <span className="text-sm font-medium w-16 text-right">{item.value}</span>
        </div>
      ))}
      {data.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">No data available yet</p>
      )}
    </div>
  );
}
