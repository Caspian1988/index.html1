// Haversine formula to calculate distance between two GPS points in miles
function calculateDistanceInMiles(lat1, lon1, lat2, lon2) {
  const EARTH_RADIUS_MILES = 3958.8; // Earth's radius in miles

  // Convert degrees to radians
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_MILES * c;

  return distance;
}

// Function to check if current GPS position is inside a target geofence
function isInsideGeofence(currentLat, currentLon, targetLat, targetLon, radiusMiles = 0.06) {
  const distance = calculateDistanceInMiles(currentLat, currentLon, targetLat, targetLon);
  return {
    inside: distance <= radiusMiles,
    distanceInMiles: distance.toFixed(3),
    distanceInFeet: Math.round(distance * 5280)
  };
}

// --- TEST RUN WITH TERMINAL COORDINATES ---

// Terminal Coordinates
const MONTGOMERY_MALL_TC = { lat: 39.0264, lon: -77.1378 };
const PARKSIDE_GROSVENOR = { lat: 39.0232, lon: -77.1042 };

// Simulated live GPS reading (e.g., pulling into Montgomery Mall Transit Center)
const currentBusLocation = { lat: 39.0265, lon: -77.1379 };

console.log('--- GEOFENCE DISTANCE CHECK ---');
const result = isInsideGeofence(
  currentBusLocation.lat,
  currentBusLocation.lon,
  MONTGOMERY_MALL_TC.lat,
  MONTGOMERY_MALL_TC.lon
);

console.log(`Current Location: ${currentBusLocation.lat}, ${currentBusLocation.lon}`);
console.log(`Distance to Montgomery Mall TC: ${result.distanceInFeet} feet (${result.distanceInMiles} miles)`);
console.log(`Geofence Triggered (Within 300ft): ${result.inside}`);