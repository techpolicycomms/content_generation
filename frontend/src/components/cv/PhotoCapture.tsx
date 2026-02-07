import { useRef, useState } from 'react';

interface Props {
  onCapture: (imageUrl: string) => void;
}

/**
 * Photo capture component for mobile and desktop.
 * Uses <input type="file" accept="image/*" capture="environment"> to trigger
 * the device camera (rear camera preferred) on mobile, or file picker on desktop.
 *
 * The captured image is uploaded and the resulting URL is passed to onCapture.
 */
export default function PhotoCapture({ onCapture }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to backend
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const token = localStorage.getItem('greenloop_token');
      const response = await fetch(`${API_URL}/collection/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      onCapture(data.imageUrl);
    } catch (err) {
      console.error('Photo upload error:', err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {preview && (
        <div className="mb-3">
          <img src={preview} alt="Captured" className="w-48 h-48 object-cover rounded-lg border" />
        </div>
      )}

      <div className="flex gap-2">
        {/* Camera capture (mobile) */}
        <label className="cursor-pointer px-4 py-2 bg-greenloop-600 text-white rounded-lg hover:bg-greenloop-700 transition text-sm">
          {uploading ? 'Uploading...' : 'Take Photo'}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>

        {/* File picker fallback */}
        <label className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">
          Choose File
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      <p className="text-xs text-gray-400 mt-2">
        Take a photo of collected items for automatic counting via computer vision.
      </p>
    </div>
  );
}
