import { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import ReturnRateChart from '@/components/charts/ReturnRateChart';
import api from '@/lib/api';

interface ImpactData {
  totalEvents: number;
  collection: {
    totalLanyards: number;
    totalPlastic: number;
    totalMetal: number;
    totalGlass: number;
    totalWeightKg: number;
  };
  processing: {
    totalBatches: number;
    totalProcessedKg: number;
  };
  sales: {
    totalOrders: number;
    totalRevenue: number;
  };
}

export default function Dashboard() {
  const [impact, setImpact] = useState<ImpactData | null>(null);

  useEffect(() => {
    api.get('/reports/impact')
      .then(res => setImpact(res.data))
      .catch(() => {/* user may not have report permissions */});
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Events" value={impact?.totalEvents ?? '—'} />
            <StatCard label="Weight Collected (kg)" value={impact?.collection.totalWeightKg ?? '—'} />
            <StatCard label="Batches Processed" value={impact?.processing.totalBatches ?? '—'} />
            <StatCard label="Total Revenue" value={impact?.sales.totalRevenue ? `$${impact.sales.totalRevenue}` : '—'} />
          </div>

          {/* Charts section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Material Recovery Rate</h2>
            <ReturnRateChart />
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-greenloop-700">{value}</p>
    </div>
  );
}
