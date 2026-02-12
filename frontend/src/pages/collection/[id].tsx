import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import PhotoCapture from '@/components/cv/PhotoCapture';
import api from '@/lib/api';

interface Reading {
  id: string;
  lanyardCount: number;
  plasticCount: number;
  metalCount: number;
  glassCount: number;
  totalWeightKg?: number;
  verified: boolean;
  createdAt: string;
  user: { id: string; name: string };
}

export default function CollectionPointPage() {
  const router = useRouter();
  const { id } = router.query;
  const [readings, setReadings] = useState<Reading[]>([]);
  const [weight, setWeight] = useState('');

  useEffect(() => {
    if (id) {
      api.get(`/collection/readings/point/${id}`).then(res => setReadings(res.data));
    }
  }, [id]);

  async function handlePhotoSubmit(imageUrl: string) {
    await api.post('/collection/readings', {
      collectionPointId: id,
      imageUrl,
      totalWeightKg: weight ? parseFloat(weight) : undefined,
    });
    // Refresh readings
    const res = await api.get(`/collection/readings/point/${id}`);
    setReadings(res.data);
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Collection Point</h1>

          {/* Photo capture for CV analysis */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Submit Reading</h2>
            <div className="mb-4">
              <label className="block text-sm text-gray-500 mb-1">Total Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="px-3 py-2 border rounded-lg w-48"
                placeholder="e.g. 5.2"
              />
            </div>
            <PhotoCapture onCapture={handlePhotoSubmit} />
          </div>

          {/* Readings table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Submitted By</th>
                  <th className="px-4 py-3 text-right">Lanyards</th>
                  <th className="px-4 py-3 text-right">Plastic</th>
                  <th className="px-4 py-3 text-right">Metal</th>
                  <th className="px-4 py-3 text-right">Glass</th>
                  <th className="px-4 py-3 text-right">Weight (kg)</th>
                  <th className="px-4 py-3 text-center">Verified</th>
                </tr>
              </thead>
              <tbody>
                {readings.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-3">{r.user.name}</td>
                    <td className="px-4 py-3 text-right">{r.lanyardCount}</td>
                    <td className="px-4 py-3 text-right">{r.plasticCount}</td>
                    <td className="px-4 py-3 text-right">{r.metalCount}</td>
                    <td className="px-4 py-3 text-right">{r.glassCount}</td>
                    <td className="px-4 py-3 text-right">{r.totalWeightKg ?? '—'}</td>
                    <td className="px-4 py-3 text-center">{r.verified ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
