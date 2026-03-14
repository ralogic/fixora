import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

let initialized = false;

function ensureMapsOptions() {
  if (initialized) {
    return;
  }

  setOptions({
    key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    v: "weekly",
    libraries: ["places"],
  });

  initialized = true;
}

export async function ensureGoogleMapsLibraries() {
  ensureMapsOptions();
  await importLibrary("maps");
  await importLibrary("marker");
  await importLibrary("places");
}
