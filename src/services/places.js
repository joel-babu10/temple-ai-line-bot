const axios = require('axios');
const localTemples = require('../data/temples.json');

function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearbyFromLocalData(lat, lng, limit = 5) {
  return localTemples
    .map((t) => ({ ...t, distanceKm: Number(haversineKm(lat, lng, t.lat, t.lng).toFixed(2)) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

async function nearbyFromGoogle(lat, lng, limit, apiKey) {
  const res = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
    params: {
      location: `${lat},${lng}`,
      radius: 3000,
      keyword: '廟 temple',
      language: 'zh-TW',
      key: apiKey
    }
  });

  return (res.data.results || []).slice(0, limit).map((r) => ({
    id: r.place_id,
    name: r.name,
    address: r.vicinity,
    lat: r.geometry.location.lat,
    lng: r.geometry.location.lng,
    distanceKm: Number(haversineKm(lat, lng, r.geometry.location.lat, r.geometry.location.lng).toFixed(2)),
    rating: r.rating || null,
    source: 'google_places'
  }));
}

// OpenStreetMap's Overpass API — free, no key, no billing account. Good enough default
// for a temple-finder: queries amenity=place_of_worship within a radius and keeps the
// ones whose name looks like a Chinese temple (廟/宮/寺/堂/庵/壇), since "place_of_worship"
// alone also matches churches/mosques.
async function nearbyFromOverpass(lat, lng, limit) {
  const query = `[out:json][timeout:20];(node["amenity"="place_of_worship"](around:4000,${lat},${lng});way["amenity"="place_of_worship"](around:4000,${lat},${lng}););out center tags;`;

  const res = await axios.post('https://overpass-api.de/api/interpreter', `data=${encodeURIComponent(query)}`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 15000
  });

  const templeNamePattern = /[廟宮寺堂庵壇]/;

  return (res.data.elements || [])
    .map((el) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLng = el.lon ?? el.center?.lon;
      const name = el.tags?.['name:zh'] || el.tags?.name || el.tags?.['name:en'];
      if (!elLat || !elLng || !name) return null;
      return {
        id: `osm-${el.type}-${el.id}`,
        name,
        address: el.tags?.['addr:full'] || [el.tags?.['addr:city'], el.tags?.['addr:street']].filter(Boolean).join(''),
        lat: elLat,
        lng: elLng,
        distanceKm: Number(haversineKm(lat, lng, elLat, elLng).toFixed(2)),
        source: 'openstreetmap'
      };
    })
    .filter((t) => t && templeNamePattern.test(t.name))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

async function nearbyTemples(lat, lng, limit = 5) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (apiKey) {
    try {
      const results = await nearbyFromGoogle(lat, lng, limit, apiKey);
      if (results.length) return results;
    } catch (err) {
      console.error('Google Places error, trying OpenStreetMap next:', err.message);
    }
  }

  try {
    const results = await nearbyFromOverpass(lat, lng, limit);
    if (results.length) return results;
  } catch (err) {
    console.error('Overpass API error, falling back to local data:', err.message);
  }

  return nearbyFromLocalData(lat, lng, limit);
}

module.exports = { nearbyTemples, nearbyFromLocalData, nearbyFromOverpass, haversineKm };
