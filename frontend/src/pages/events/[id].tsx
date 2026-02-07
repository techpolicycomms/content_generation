import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import GpsLocationPicker from '@/components/maps/GpsLocationPicker';
import api from '@/lib/api';

interface EventDetail {
  id: string;
  title: string;
  description?: string;
  date: string;
  location: string;
  latitude?: number;
  longitude?: number;
  status: string;
  organiser: { id: string; name: string };
  participants: { user: { id: string; name: string }; role: string }[];
  collectionPoints: { id: string; name: string; latitude: number; longitude: number }[];
}

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [event, setEvent] = useState<EventDetail | null>(null);

  useEffect(() => {
    if (id) {
      api.get(`/events/${id}`).then(res => setEvent(res.data));
    }
  }, [id]);

  if (!event) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{event.title}</h1>
            <p className="text-gray-500 mb-4">{event.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p>{new Date(event.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p>{event.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className="px-2 py-1 text-xs rounded bg-greenloop-100 text-greenloop-700">
                  {event.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Organiser</p>
                <p>{event.organiser.name}</p>
              </div>
            </div>

            {/* Map showing collection points */}
            {event.latitude && event.longitude && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Collection Points</h2>
                <GpsLocationPicker
                  defaultLat={event.latitude}
                  defaultLng={event.longitude}
                  markers={event.collectionPoints.map(cp => ({
                    lat: cp.latitude,
                    lng: cp.longitude,
                    label: cp.name,
                  }))}
                />
              </div>
            )}

            {/* Participants */}
            <h2 className="text-lg font-semibold mb-2">
              Participants ({event.participants.length})
            </h2>
            <ul className="space-y-1">
              {event.participants.map((p) => (
                <li key={p.user.id} className="flex items-center gap-2">
                  <span>{p.user.name}</span>
                  <span className="text-xs text-gray-400">({p.role})</span>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
