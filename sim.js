// sim.js — SmartCloudPark IoT simulator (uses Node global fetch, no extra packages required)
// Requires Node 18+ (you have Node 22 so it's fine).
// It uses the Supabase REST API and your SERVICE_ROLE key (keep that secret).
// Usage (Windows CMD): set SUPABASE_URL=... && set SUPABASE_SERVICE_ROLE=... && node sim.js

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE environment variables.');
  console.error('Set them in your shell, then run: node sim.js');
  process.exit(1);
}

const NUM_SLOTS = 10;
const INTERVAL_MS = 3000; // update every 3 seconds

function randSlot() {
  return Math.floor(Math.random() * NUM_SLOTS) + 1;
}

async function updateSlot(slotId, occupied) {
  const url = `${SUPABASE_URL}/rest/v1/parking_slots?slot_id=eq.${slotId}`;
  const body = JSON.stringify({ occupied, last_updated: new Date().toISOString() });

  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`,
        'Prefer': 'return=representation'
      },
      body
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`HTTP ${res.status} updating slot ${slotId}:`, text);
      return false;
    }

    const json = await res.json();
    console.log(`Updated slot ${slotId} -> ${occupied ? 'occupied' : 'free'}`, json);
    return true;
  } catch (err) {
    console.error('Network/error updating slot:', err.message || err);
    return false;
  }
}

async function tick() {
  const slotId = randSlot();
  const occupied = Math.random() > 0.5;
  await updateSlot(slotId, occupied);
}

console.log('Simulator started — updating every', INTERVAL_MS, 'ms. Press Ctrl+C to stop.');
setInterval(tick, INTERVAL_MS);
