const axios = require('axios');
const localTemples = require('../data/temples.json');

function fallbackTransitText(temple) {
  const bus = (temple.nearestBus || []).join('、') || '（尚無資料）';
  const rail = temple.nearestRail || '（尚無資料）';
  return {
    source: 'local_data',
    summary: `建議搭公車到「${bus}」站下車，或搭乘台鐵至${rail}後步行前往。實際班次請查台中市公車動態或台鐵時刻表。`,
    steps: []
  };
}

/**
 * originLat/Lng: user's current location (from LIFF liff.getLocation()).
 * templeId: id in src/data/temples.json.
 */
async function getTransitDirections(originLat, originLng, templeId) {
  const temple = localTemples.find((t) => t.id === templeId);
  if (!temple) throw new Error(`Unknown temple id: ${templeId}`);

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return { temple: temple.name, ...fallbackTransitText(temple) };
  }

  try {
    const res = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin: `${originLat},${originLng}`,
        destination: `${temple.lat},${temple.lng}`,
        mode: 'transit',
        language: 'zh-TW',
        key: apiKey
      }
    });

    const route = res.data.routes && res.data.routes[0];
    if (!route) return { temple: temple.name, ...fallbackTransitText(temple) };

    const leg = route.legs[0];
    const steps = leg.steps.map((s) => ({
      instruction: s.html_instructions.replace(/<[^>]+>/g, ''),
      travelMode: s.travel_mode,
      duration: s.duration.text,
      transitLine: s.transit_details ? s.transit_details.line.short_name || s.transit_details.line.name : null
    }));

    return {
      temple: temple.name,
      source: 'google_directions',
      summary: `全程約 ${leg.duration.text}（${leg.distance.text}）`,
      steps
    };
  } catch (err) {
    console.error('Directions API error, falling back to local data:', err.message);
    return { temple: temple.name, ...fallbackTransitText(temple) };
  }
}

module.exports = { getTransitDirections };
