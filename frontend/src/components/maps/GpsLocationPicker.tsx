import { useEffect, useState } from 'react';

interface Marker {
  lat: number;
  lng: number;
  label: string;
}

interface Props {
  defaultLat?: number;
  defaultLng?: number;
  markers?: Marker[];
  onLocationSelect?: (lat: number, lng: number) => void;
}

/**
 * GPS Location Picker component.
 * Uses the browser Geolocation API to get the user's current position.
 * Renders markers on a map (Leaflet integration ready).
 *
 * Note: Geolocation requires HTTPS and user permission.
 */
export default function GpsLocationPicker({ defaultLat, defaultLng, markers = [], onLocationSelect }: Props) {
  const [lat, setLat] = useState(defaultLat ?? 0);
  const [lng, setLng] = useState(defaultLng ?? 0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function requestLocation() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setLoading(false);
        onLocationSelect?.(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        setError(`Location error: ${err.message}`);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  useEffect(() => {
    if (!defaultLat && !defaultLng) {
      requestLocation();
    }
  }, []);

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Map placeholder - integrate with react-leaflet for production */}
      <div className="bg-gray-200 h-64 flex items-center justify-center relative">
        <div className="text-center">
          <p className="text-sm text-gray-500">Map View</p>
          <p className="text-xs text-gray-400">
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </p>
          {markers.length > 0 && (
            <p className="text-xs text-greenloop-600 mt-1">
              {markers.length} collection point{markers.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      <div className="p-3 flex items-center justify-between bg-white">
        <div className="text-sm">
          <span className="text-gray-500">Lat:</span> {lat.toFixed(6)}{' '}
          <span className="text-gray-500 ml-2">Lng:</span> {lng.toFixed(6)}
        </div>
        <button
          onClick={requestLocation}
          disabled={loading}
          className="text-sm px-3 py-1 bg-greenloop-600 text-white rounded hover:bg-greenloop-700 disabled:opacity-50"
        >
          {loading ? 'Locating...' : 'Use My Location'}
        </button>
      </div>

      {error && <p className="px-3 py-2 text-red-500 text-xs bg-red-50">{error}</p>}
    </div>
  );
}
