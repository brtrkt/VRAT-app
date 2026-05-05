/**
 * Sunrise calculation (NOAA / Almanac algorithm) and Brahma Muhurta window
 * derivation.
 *
 * Brahma Muhurta is the 14th muhurta of the night — the 96-minute window
 * ending 48 minutes before local sunrise. By Vedic convention:
 *   start = sunrise - 96 min
 *   end   = sunrise - 48 min
 *
 * This module is fully self-contained: no external sun/astronomy library
 * is needed. Accuracy is ~1 minute, more than enough for sadhana timing.
 */

export type Coords = { lat: number; lon: number; label: string };

export type UserLocationId = "india" | "uk" | "usa" | "australia";

const LOCATION_FALLBACK: Record<UserLocationId, Coords> = {
  india: { lat: 28.6139, lon: 77.2090, label: "Delhi" },
  uk: { lat: 51.5074, lon: -0.1278, label: "London" },
  usa: { lat: 40.7128, lon: -74.006, label: "New York" },
  australia: { lat: -33.8688, lon: 151.2093, label: "Sydney" },
};

const CITIES: Coords[] = [
  // India — major metros
  { label: "Delhi", lat: 28.6139, lon: 77.2090 },
  { label: "New Delhi", lat: 28.6139, lon: 77.2090 },
  { label: "Mumbai", lat: 19.0760, lon: 72.8777 },
  { label: "Bombay", lat: 19.0760, lon: 72.8777 },
  { label: "Bengaluru", lat: 12.9716, lon: 77.5946 },
  { label: "Bangalore", lat: 12.9716, lon: 77.5946 },
  { label: "Chennai", lat: 13.0827, lon: 80.2707 },
  { label: "Madras", lat: 13.0827, lon: 80.2707 },
  { label: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { label: "Calcutta", lat: 22.5726, lon: 88.3639 },
  { label: "Hyderabad", lat: 17.3850, lon: 78.4867 },
  { label: "Pune", lat: 18.5204, lon: 73.8567 },
  { label: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
  { label: "Surat", lat: 21.1702, lon: 72.8311 },
  { label: "Jaipur", lat: 26.9124, lon: 75.7873 },
  { label: "Lucknow", lat: 26.8467, lon: 80.9462 },
  { label: "Kanpur", lat: 26.4499, lon: 80.3319 },
  { label: "Nagpur", lat: 21.1458, lon: 79.0882 },
  { label: "Indore", lat: 22.7196, lon: 75.8577 },
  { label: "Bhopal", lat: 23.2599, lon: 77.4126 },
  { label: "Patna", lat: 25.5941, lon: 85.1376 },
  { label: "Vadodara", lat: 22.3072, lon: 73.1812 },
  { label: "Ludhiana", lat: 30.9010, lon: 75.8573 },
  { label: "Agra", lat: 27.1767, lon: 78.0081 },
  { label: "Varanasi", lat: 25.3176, lon: 82.9739 },
  { label: "Kashi", lat: 25.3176, lon: 82.9739 },
  { label: "Amritsar", lat: 31.6340, lon: 74.8723 },
  { label: "Chandigarh", lat: 30.7333, lon: 76.7794 },
  { label: "Coimbatore", lat: 11.0168, lon: 76.9558 },
  { label: "Madurai", lat: 9.9252, lon: 78.1198 },
  { label: "Thiruvananthapuram", lat: 8.5241, lon: 76.9366 },
  { label: "Trivandrum", lat: 8.5241, lon: 76.9366 },
  { label: "Kochi", lat: 9.9312, lon: 76.2673 },
  { label: "Cochin", lat: 9.9312, lon: 76.2673 },
  { label: "Visakhapatnam", lat: 17.6868, lon: 83.2185 },
  { label: "Vijayawada", lat: 16.5062, lon: 80.6480 },
  { label: "Mysuru", lat: 12.2958, lon: 76.6394 },
  { label: "Mysore", lat: 12.2958, lon: 76.6394 },
  { label: "Bhubaneswar", lat: 20.2961, lon: 85.8245 },
  { label: "Guwahati", lat: 26.1445, lon: 91.7362 },
  { label: "Dehradun", lat: 30.3165, lon: 78.0322 },
  { label: "Shimla", lat: 31.1048, lon: 77.1734 },
  { label: "Srinagar", lat: 34.0837, lon: 74.7973 },
  { label: "Jodhpur", lat: 26.2389, lon: 73.0243 },
  { label: "Udaipur", lat: 24.5854, lon: 73.7125 },
  { label: "Prayagraj", lat: 25.4358, lon: 81.8463 },
  { label: "Allahabad", lat: 25.4358, lon: 81.8463 },
  { label: "Rishikesh", lat: 30.0869, lon: 78.2676 },
  { label: "Haridwar", lat: 29.9457, lon: 78.1642 },
  { label: "Mathura", lat: 27.4924, lon: 77.6737 },
  { label: "Vrindavan", lat: 27.5650, lon: 77.6593 },
  { label: "Ujjain", lat: 23.1765, lon: 75.7885 },
  { label: "Pandharpur", lat: 17.6794, lon: 75.3315 },
  { label: "Tirupati", lat: 13.6288, lon: 79.4192 },
  { label: "Rameshwaram", lat: 9.2876, lon: 79.3129 },
  { label: "Puri", lat: 19.8135, lon: 85.8312 },
  { label: "Dwarka", lat: 22.2394, lon: 68.9678 },
  { label: "Somnath", lat: 20.8880, lon: 70.4017 },
  { label: "Ayodhya", lat: 26.7922, lon: 82.1998 },
  { label: "Gorakhpur", lat: 26.7606, lon: 83.3732 },
  { label: "Shirdi", lat: 19.7645, lon: 74.4769 },
  { label: "Ranchi", lat: 23.3441, lon: 85.3096 },
  { label: "Raipur", lat: 21.2514, lon: 81.6296 },
  { label: "Gandhinagar", lat: 23.2156, lon: 72.6369 },
  { label: "Rajkot", lat: 22.3039, lon: 70.8022 },
  { label: "Junagadh", lat: 21.5222, lon: 70.4579 },

  // UK
  { label: "London", lat: 51.5074, lon: -0.1278 },
  { label: "Birmingham", lat: 52.4862, lon: -1.8904 },
  { label: "Leicester", lat: 52.6369, lon: -1.1398 },
  { label: "Manchester", lat: 53.4808, lon: -2.2426 },
  { label: "Glasgow", lat: 55.8642, lon: -4.2518 },
  { label: "Leeds", lat: 53.8008, lon: -1.5491 },
  { label: "Bradford", lat: 53.7950, lon: -1.7594 },
  { label: "Edinburgh", lat: 55.9533, lon: -3.1883 },
  { label: "Cardiff", lat: 51.4816, lon: -3.1791 },
  { label: "Wolverhampton", lat: 52.5862, lon: -2.1288 },
  { label: "Coventry", lat: 52.4068, lon: -1.5197 },
  { label: "Slough", lat: 51.5105, lon: -0.5950 },
  { label: "Southall", lat: 51.5074, lon: -0.3762 },
  { label: "Harrow", lat: 51.5805, lon: -0.3415 },
  { label: "Wembley", lat: 51.5560, lon: -0.2795 },

  // North America
  { label: "New York", lat: 40.7128, lon: -74.0060 },
  { label: "NYC", lat: 40.7128, lon: -74.0060 },
  { label: "Edison", lat: 40.5187, lon: -74.4121 },
  { label: "Jersey City", lat: 40.7178, lon: -74.0431 },
  { label: "Houston", lat: 29.7604, lon: -95.3698 },
  { label: "Dallas", lat: 32.7767, lon: -96.7970 },
  { label: "Austin", lat: 30.2672, lon: -97.7431 },
  { label: "Atlanta", lat: 33.7490, lon: -84.3880 },
  { label: "Chicago", lat: 41.8781, lon: -87.6298 },
  { label: "Los Angeles", lat: 34.0522, lon: -118.2437 },
  { label: "LA", lat: 34.0522, lon: -118.2437 },
  { label: "San Francisco", lat: 37.7749, lon: -122.4194 },
  { label: "San Jose", lat: 37.3382, lon: -121.8863 },
  { label: "Fremont", lat: 37.5485, lon: -121.9886 },
  { label: "Seattle", lat: 47.6062, lon: -122.3321 },
  { label: "Boston", lat: 42.3601, lon: -71.0589 },
  { label: "Washington", lat: 38.9072, lon: -77.0369 },
  { label: "Washington DC", lat: 38.9072, lon: -77.0369 },
  { label: "Philadelphia", lat: 39.9526, lon: -75.1652 },
  { label: "Phoenix", lat: 33.4484, lon: -112.0740 },
  { label: "Denver", lat: 39.7392, lon: -104.9903 },
  { label: "Miami", lat: 25.7617, lon: -80.1918 },
  { label: "Minneapolis", lat: 44.9778, lon: -93.2650 },
  { label: "Toronto", lat: 43.6532, lon: -79.3832 },
  { label: "Brampton", lat: 43.7315, lon: -79.7624 },
  { label: "Mississauga", lat: 43.5890, lon: -79.6441 },
  { label: "Vancouver", lat: 49.2827, lon: -123.1207 },
  { label: "Surrey", lat: 49.1913, lon: -122.8490 },
  { label: "Calgary", lat: 51.0447, lon: -114.0719 },
  { label: "Edmonton", lat: 53.5461, lon: -113.4938 },
  { label: "Montreal", lat: 45.5017, lon: -73.5673 },
  { label: "Ottawa", lat: 45.4215, lon: -75.6972 },

  // Australia / NZ
  { label: "Sydney", lat: -33.8688, lon: 151.2093 },
  { label: "Melbourne", lat: -37.8136, lon: 144.9631 },
  { label: "Brisbane", lat: -27.4698, lon: 153.0251 },
  { label: "Perth", lat: -31.9505, lon: 115.8605 },
  { label: "Adelaide", lat: -34.9285, lon: 138.6007 },
  { label: "Canberra", lat: -35.2809, lon: 149.1300 },
  { label: "Auckland", lat: -36.8485, lon: 174.7633 },
  { label: "Wellington", lat: -41.2865, lon: 174.7762 },
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Resolve a free-text city + diaspora location to coordinates.
 * Falls back to the location capital, then Delhi.
 */
export function resolveCoords(
  city: string | null | undefined,
  location: UserLocationId | null | undefined
): Coords {
  const fallback =
    LOCATION_FALLBACK[(location as UserLocationId) ?? "india"] ??
    LOCATION_FALLBACK.india;

  if (!city || !city.trim()) return fallback;

  const needle = normalize(city);
  // Try exact match first, then prefix, then substring.
  const exact = CITIES.find((c) => normalize(c.label) === needle);
  if (exact) return exact;
  const prefix = CITIES.find((c) => normalize(c.label).startsWith(needle));
  if (prefix) return prefix;
  const sub = CITIES.find(
    (c) => normalize(c.label).includes(needle) || needle.includes(normalize(c.label))
  );
  if (sub) return sub;
  return fallback;
}

/**
 * NOAA-style sunrise calculator. Returns a Date in UTC for the moment of
 * official sunrise (zenith 90.833°) on the given date at (lat, lon).
 * Returns null at extreme latitudes where the sun does not rise that day.
 */
export function calcSunriseUTC(date: Date, lat: number, lon: number): Date | null {
  const zenith = 90.833;
  const rad = Math.PI / 180;

  // Day of year
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start;
  const N = Math.floor(diff / 86400000);

  const lngHour = lon / 15;
  const t = N + (6 - lngHour) / 24; // sunrise

  const M = 0.9856 * t - 3.289;

  let L =
    M +
    1.916 * Math.sin(M * rad) +
    0.020 * Math.sin(2 * M * rad) +
    282.634;
  L = ((L % 360) + 360) % 360;

  let RA = Math.atan(0.91764 * Math.tan(L * rad)) / rad;
  RA = ((RA % 360) + 360) % 360;

  const Lquadrant = Math.floor(L / 90) * 90;
  const RAquadrant = Math.floor(RA / 90) * 90;
  RA = RA + (Lquadrant - RAquadrant);
  RA = RA / 15;

  const sinDec = 0.39782 * Math.sin(L * rad);
  const cosDec = Math.cos(Math.asin(sinDec));

  const cosH =
    (Math.cos(zenith * rad) - sinDec * Math.sin(lat * rad)) /
    (cosDec * Math.cos(lat * rad));
  if (cosH > 1 || cosH < -1) return null;

  let H = 360 - Math.acos(cosH) / rad;
  H = H / 15;

  const T = H + RA - 0.06571 * t - 6.622;
  let UT = T - lngHour;
  UT = ((UT % 24) + 24) % 24;

  const hours = Math.floor(UT);
  const minutes = (UT - hours) * 60;
  const wholeMin = Math.floor(minutes);
  const seconds = Math.round((minutes - wholeMin) * 60);

  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      hours,
      wholeMin,
      seconds
    )
  );
}

export type BrahmaWindow = {
  start: Date;
  end: Date;
  sunrise: Date;
  coords: Coords;
  approximate: boolean;
};

/**
 * Brahma Muhurta = the 14th muhurta of the night, ending 48 minutes
 * before sunrise. So:
 *   start = sunrise - 96 min
 *   end   = sunrise - 48 min
 */
export function getBrahmaMuhurta(
  date: Date,
  city: string | null | undefined,
  location: UserLocationId | null | undefined
): BrahmaWindow {
  const coords = resolveCoords(city, location);
  const sunriseUTC = calcSunriseUTC(date, coords.lat, coords.lon);

  if (!sunriseUTC) {
    // Polar fallback — use 5:30 AM local
    const fallback = new Date(date);
    fallback.setHours(5, 30, 0, 0);
    return {
      start: new Date(fallback.getTime() - 96 * 60_000),
      end: new Date(fallback.getTime() - 48 * 60_000),
      sunrise: fallback,
      coords,
      approximate: true,
    };
  }

  return {
    start: new Date(sunriseUTC.getTime() - 96 * 60_000),
    end: new Date(sunriseUTC.getTime() - 48 * 60_000),
    sunrise: sunriseUTC,
    coords,
    approximate: false,
  };
}

export function formatLocalTime(d: Date): string {
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
