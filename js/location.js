// Pede a localização ao navegador. Resolve com { lat, lon } ou null (negada, indisponível ou demorou demais).
export function requestLocation() {
  return new Promise((resolve) => {
    try {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: false, timeout: 10_000, maximumAge: 24 * 3_600_000 },
      );
    } catch {
      resolve(null);
    }
  });
}
