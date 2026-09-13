const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());

// Serve the frontend from the project root
app.use(express.static(__dirname));

// Fallback explicit route for the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// --- TERMINAL COORDINATES ---
const TERMINALS = {
  MONTGOMERY_MALL: { name: 'Montgomery Mall TC', lat: 39.0264, lon: -77.1378 },
  PARKSIDE: { name: 'Parkside / Grosvenor', lat: 39.0232, lon: -77.1042 }
};

// --- GEOFENCE MATH ---
function calculateDistanceInMiles(lat1, lon1, lat2, lon2) {
  const EARTH_RADIUS_MILES = 3958.8;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_MILES * c;
}

function checkGeofences(currentLat, currentLon, radiusMiles = 0.06) {
  const distMontgomery = calculateDistanceInMiles(
    currentLat,
    currentLon,
    TERMINALS.MONTGOMERY_MALL.lat,
    TERMINALS.MONTGOMERY_MALL.lon
  );

  const distParkside = calculateDistanceInMiles(
    currentLat,
    currentLon,
    TERMINALS.PARKSIDE.lat,
    TERMINALS.PARKSIDE.lon
  );

  if (distMontgomery <= radiusMiles) {
    return { inside: true, terminal: 'MONTGOMERY_MALL', distanceFeet: Math.round(distMontgomery * 5280) };
  }
  if (distParkside <= radiusMiles) {
    return { inside: true, terminal: 'PARKSIDE', distanceFeet: Math.round(distParkside * 5280) };
  }

  return { inside: false, terminal: null };
}

// --- SHIFT STATE STORE ---
let shiftData = {
  totalTrips: 0,
  lastKnownTerminal: null,
  tripHistory: []
};

// --- API ENDPOINTS ---

app.get('/api/shift', (req, res) => {
  res.status(200).json({
    success: true,
    totalTrips: shiftData.totalTrips,
    lastKnownTerminal: shiftData.lastKnownTerminal,
    tripHistory: shiftData.tripHistory
  });
});

app.post('/api/location', (req, res) => {
  const { lat, lon } = req.body;

  if (!lat || !lon) {
    return res.status(400).json({ success: false, message: 'Missing lat or lon coordinates.' });
  }

  const fenceCheck = checkGeofences(lat, lon);
  let tripIncremented = false;

  if (fenceCheck.inside) {
    const currentTerminal = fenceCheck.terminal;

    if (shiftData.lastKnownTerminal && shiftData.lastKnownTerminal !== currentTerminal) {
      shiftData.totalTrips += 1;
      tripIncremented = true;

      const completedTripLog = {
        tripNumber: shiftData.totalTrips,
        from: TERMINALS[shiftData.lastKnownTerminal].name,
        to: TERMINALS[currentTerminal].name,
        timestamp: new Date().toLocaleTimeString()
      };

      shiftData.tripHistory.push(completedTripLog);
    }

    shiftData.lastKnownTerminal = currentTerminal;
  }

  res.status(200).json({
    success: true,
    insideGeofence: fenceCheck.inside,
    currentTerminal: fenceCheck.terminal,
    tripIncremented: tripIncremented,
    totalTrips: shiftData.totalTrips
  });
});

app.post('/api/shift/reset', (req, res) => {
  shiftData = {
    totalTrips: 0,
    lastKnownTerminal: null,
    tripHistory: []
  };

  res.status(200).json({ success: true, message: 'Shift trip counter reset.' });
});

app.listen(PORT, () => {
  console.log(`[TRANSIT API RUNNING] Server live on http://localhost:${PORT}`);
});