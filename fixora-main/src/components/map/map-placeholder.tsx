type MapPlaceholderProps = {
  latitude: number;
  longitude: number;
};

export function MapPlaceholder({ latitude, longitude }: MapPlaceholderProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-sky-50 to-cyan-50 p-4">
      <h4 className="mb-2 text-sm font-semibold text-slate-900">Google Maps Integration</h4>
      <p className="text-sm text-slate-600">Connect this block to Google Maps JavaScript API using NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.</p>
      <p className="mt-2 text-xs text-slate-500">
        Live Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
      </p>
    </div>
  );
}
