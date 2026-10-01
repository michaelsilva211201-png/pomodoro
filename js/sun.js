// Nascer e pôr do sol pela equação do nascer do sol (algoritmo simplificado da NOAA).
// Precisão de ~1–2 minutos fora das regiões polares. Tudo em ms desde a época (UTC).

const RAD = Math.PI / 180;
const DAY_MS = 86_400_000;
const J1970 = 2440587.5;
const J2000 = 2451545.0;

const toJulian = (ms) => ms / DAY_MS + J1970;
const fromJulian = (j) => (j - J1970) * DAY_MS;

// dayMs: qualquer instante do dia desejado (de preferência o meio-dia local).
// Retorna { sunrise, sunset } ou { polar: 'day' | 'night' } quando o sol não nasce ou não se põe.
export function sunTimes(dayMs, lat, lon) {
  const n = Math.round(toJulian(dayMs) - J2000 - 0.0009 + lon / 360);
  const meanSolarTime = n + 0.0009 - lon / 360;
  const M = (357.5291 + 0.98560028 * meanSolarTime) % 360; // anomalia média
  const C = 1.9148 * Math.sin(M * RAD) + 0.02 * Math.sin(2 * M * RAD) + 0.0003 * Math.sin(3 * M * RAD);
  const lambda = (M + C + 180 + 102.9372) % 360; // longitude eclíptica
  const transit = J2000 + meanSolarTime + 0.0053 * Math.sin(M * RAD) - 0.0069 * Math.sin(2 * lambda * RAD);
  const sinDecl = Math.sin(lambda * RAD) * Math.sin(23.4397 * RAD);
  const cosDecl = Math.cos(Math.asin(sinDecl));
  // -0.833°: refração atmosférica + raio do disco solar
  const cosH = (Math.sin(-0.833 * RAD) - Math.sin(lat * RAD) * sinDecl) / (Math.cos(lat * RAD) * cosDecl);
  if (cosH < -1) return { polar: 'day' };
  if (cosH > 1) return { polar: 'night' };
  const halfDay = Math.acos(cosH) / RAD / 360;
  return { sunrise: fromJulian(transit - halfDay), sunset: fromJulian(transit + halfDay) };
}
