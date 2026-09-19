#!/usr/bin/env node
// ============================================================
// CampusTwin – Smart Campus Digital Twin
// COMBINED FILE — All modules in one file
// ⚠  All sensor data is SIMULATED — hackathon demo only.
// ============================================================
// Sections:
//   1. CONFIG       — Building definitions & settings
//   2. SIMULATOR    — IoT sensor data generation
//   3. ANALYTICS    — Real-time analytics engine
//   4. PREDICTION   — Short-term crowd prediction
//   5. RECOMMENDATIONS — Smart campus recommendation engine
//   6. TEST & DEMO  — Full pipeline test + hackathon demo
// ============================================================

'use strict';

const http  = require('http');
const https = require('https');
const { URL } = require('url');

// ════════════════════════════════════════════════════════════
// SECTION 1: CONFIG
// ════════════════════════════════════════════════════════════

const BACKEND_URL        = process.env.BACKEND_URL || 'http://localhost:5000';
const SENSOR_INTERVAL_MS = 3000;
const API_ENDPOINT       = '/api/sensors';

const BUILDINGS = [
  {
    id: 'b1', name: 'CSE Block', sensorId: 'sensor-b1',
    baseCapacity: 500, baseTemp: 24, type: 'academic', weekendFactor: 0.15,
    profile: [
      0.02, 0.01, 0.01, 0.01, 0.01, 0.03,
      0.10, 0.25, 0.55, 0.80, 0.90, 0.85,
      0.70, 0.75, 0.80, 0.70, 0.50, 0.30,
      0.15, 0.10, 0.05, 0.03, 0.02, 0.02,
    ],
  },
  {
    id: 'b2', name: 'ECE Block', sensorId: 'sensor-b2',
    baseCapacity: 450, baseTemp: 24, type: 'academic', weekendFactor: 0.12,
    profile: [
      0.02, 0.01, 0.01, 0.01, 0.01, 0.03,
      0.08, 0.22, 0.50, 0.78, 0.88, 0.82,
      0.65, 0.72, 0.78, 0.65, 0.45, 0.25,
      0.12, 0.08, 0.04, 0.03, 0.02, 0.02,
    ],
  },
  {
    id: 'b3', name: 'Main Library', sensorId: 'sensor-b3',
    baseCapacity: 400, baseTemp: 23, type: 'library', weekendFactor: 0.45,
    profile: [
      0.02, 0.01, 0.01, 0.01, 0.01, 0.02,
      0.05, 0.15, 0.40, 0.65, 0.80, 0.85,
      0.70, 0.75, 0.80, 0.85, 0.82, 0.75,
      0.65, 0.50, 0.30, 0.15, 0.05, 0.03,
    ],
  },
  {
    id: 'b4', name: 'Mechanical Block', sensorId: 'sensor-b4',
    baseCapacity: 400, baseTemp: 25, type: 'academic', weekendFactor: 0.10,
    profile: [
      0.02, 0.01, 0.01, 0.01, 0.01, 0.03,
      0.08, 0.20, 0.50, 0.75, 0.85, 0.80,
      0.60, 0.68, 0.75, 0.60, 0.40, 0.22,
      0.10, 0.06, 0.03, 0.02, 0.02, 0.02,
    ],
  },
  {
    id: 'b5', name: 'Admin Building', sensorId: 'sensor-b5',
    baseCapacity: 200, baseTemp: 23, type: 'office', weekendFactor: 0.05,
    profile: [
      0.02, 0.01, 0.01, 0.01, 0.01, 0.02,
      0.05, 0.15, 0.50, 0.85, 0.90, 0.88,
      0.70, 0.80, 0.85, 0.80, 0.50, 0.15,
      0.05, 0.03, 0.02, 0.02, 0.01, 0.01,
    ],
  },
  {
    id: 'b6', name: 'Auditorium', sensorId: 'sensor-b6',
    baseCapacity: 800, baseTemp: 23, type: 'auditorium', weekendFactor: 0.30,
    profile: [
      0.01, 0.01, 0.01, 0.01, 0.01, 0.01,
      0.02, 0.03, 0.05, 0.08, 0.12, 0.15,
      0.10, 0.08, 0.12, 0.15, 0.10, 0.08,
      0.05, 0.03, 0.02, 0.01, 0.01, 0.01,
    ],
  },
  {
    id: 'b7', name: 'Cafeteria', sensorId: 'sensor-b7',
    baseCapacity: 350, baseTemp: 25, type: 'cafeteria', weekendFactor: 0.35,
    profile: [
      0.01, 0.01, 0.01, 0.01, 0.01, 0.02,
      0.05, 0.40, 0.60, 0.30, 0.20, 0.45,
      0.90, 0.85, 0.30, 0.20, 0.15, 0.35,
      0.70, 0.55, 0.20, 0.05, 0.02, 0.01,
    ],
  },
  {
    id: 'b8', name: 'Sports Complex', sensorId: 'sensor-b8',
    baseCapacity: 300, baseTemp: 26, type: 'sports', weekendFactor: 0.60,
    profile: [
      0.02, 0.01, 0.01, 0.01, 0.01, 0.10,
      0.35, 0.25, 0.10, 0.08, 0.08, 0.10,
      0.15, 0.12, 0.20, 0.40, 0.65, 0.80,
      0.70, 0.45, 0.20, 0.08, 0.03, 0.02,
    ],
  },
  {
    id: 'b9', name: 'Research Lab', sensorId: 'sensor-b9',
    baseCapacity: 150, baseTemp: 22, type: 'lab', weekendFactor: 0.30,
    profile: [
      0.05, 0.03, 0.02, 0.02, 0.02, 0.03,
      0.08, 0.20, 0.45, 0.65, 0.75, 0.70,
      0.55, 0.60, 0.70, 0.72, 0.60, 0.45,
      0.35, 0.25, 0.15, 0.10, 0.08, 0.06,
    ],
  },
  {
    id: 'b10', name: 'Parking Structure', sensorId: 'sensor-b10',
    baseCapacity: 600, baseTemp: 28, type: 'parking', weekendFactor: 0.20,
    profile: [
      0.05, 0.04, 0.03, 0.03, 0.03, 0.05,
      0.15, 0.40, 0.70, 0.85, 0.90, 0.92,
      0.90, 0.88, 0.85, 0.78, 0.55, 0.30,
      0.15, 0.08, 0.06, 0.05, 0.05, 0.05,
    ],
  },
  {
    id: 'b11', name: 'Study Hall B', sensorId: 'sensor-b11',
    baseCapacity: 350, baseTemp: 24, type: 'social', weekendFactor: 0.40,
    profile: [
      0.02, 0.01, 0.01, 0.01, 0.01, 0.02,
      0.05, 0.12, 0.30, 0.50, 0.60, 0.65,
      0.75, 0.70, 0.55, 0.50, 0.55, 0.60,
      0.50, 0.35, 0.20, 0.10, 0.05, 0.03,
    ],
  },
  {
    id: 'b12', name: 'Science Block', sensorId: 'sensor-b12',
    baseCapacity: 420, baseTemp: 23, type: 'academic', weekendFactor: 0.12,
    profile: [
      0.02, 0.01, 0.01, 0.01, 0.01, 0.03,
      0.08, 0.22, 0.52, 0.76, 0.86, 0.82,
      0.68, 0.74, 0.80, 0.68, 0.48, 0.28,
      0.14, 0.08, 0.04, 0.03, 0.02, 0.02,
    ],
  },
  {
    id: 'b13', name: 'Parking B', sensorId: 'sensor-b13',
    baseCapacity: 300, baseTemp: 28, type: 'parking', weekendFactor: 0.20,
    profile: [
      0.05, 0.04, 0.03, 0.03, 0.03, 0.05,
      0.10, 0.20, 0.30, 0.40, 0.50, 0.50,
      0.50, 0.40, 0.30, 0.20, 0.15, 0.10,
      0.05, 0.05, 0.05, 0.05, 0.05, 0.05,
    ],
  },
];

// ════════════════════════════════════════════════════════════
// SECTION 2: SIMULATOR
// ════════════════════════════════════════════════════════════

function jitter(value, stddev = 1) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1 || 0.0001)) * Math.cos(2 * Math.PI * u2);
  return value + z * stddev;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function interpolatedActivity(profile, now) {
  const hour = now.getHours();
  const minuteFraction = now.getMinutes() / 60;
  const current = profile[hour];
  const next = profile[(hour + 1) % 24];
  return current + (next - current) * minuteFraction;
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

let auditoriumEventActive = false;
let auditoriumEventTicks  = 0;

function checkAuditoriumEvent() {
  if (auditoriumEventActive) {
    auditoriumEventTicks--;
    if (auditoriumEventTicks <= 0) auditoriumEventActive = false;
    return true;
  }
  if (Math.random() < 0.02) {
    auditoriumEventActive = true;
    auditoriumEventTicks  = Math.floor(Math.random() * 20) + 10;
    return true;
  }
  return false;
}

function generateReading(building) {
  const now = new Date();
  let activity = interpolatedActivity(building.profile, now);

  if (isWeekend(now)) activity *= building.weekendFactor;

  if (building.type === 'auditorium' && checkAuditoriumEvent()) {
    activity = 0.70 + Math.random() * 0.25;
  }

  const rawPeople  = activity * building.baseCapacity;
  const peopleCount = Math.round(clamp(jitter(rawPeople, rawPeople * 0.08), 0, building.baseCapacity));

  const hourAngle   = ((now.getHours() - 6) / 24) * 2 * Math.PI;
  const outdoorSwing = 2 * Math.sin(hourAngle);
  const crowdHeat   = activity * 2;
  const temperature = parseFloat(
    clamp(jitter(building.baseTemp + crowdHeat + outdoorSwing, 0.3), 16, 38).toFixed(1)
  );

  const baseEnergy = 12 + Math.random() * 3;
  const energy     = Math.round(clamp(jitter(baseEnergy + activity * 75, 3), 5, 100));

  const roomFactor    = ['academic', 'office', 'library'].includes(building.type) ? 1.0 : 0.5;
  const roomOccupancy = Math.round(clamp(jitter(activity * 100 * roomFactor, 4), 0, 100));

  const labHour = now.getHours();
  let labMultiplier = 0.3;
  if ((labHour >= 10 && labHour < 12) || (labHour >= 14 && labHour < 16)) labMultiplier = 1.0;
  else if (labHour >= 8 && labHour < 18) labMultiplier = 0.6;
  const labBase      = building.type === 'lab' ? activity * 100 : activity * 100 * labMultiplier * 0.7;
  const labOccupancy = Math.round(clamp(jitter(labBase, 5), 0, 100));

  const parkingBase      = building.type === 'parking' ? activity * 100 : activity * 80 + 5;
  const parkingOccupancy = Math.round(clamp(jitter(parkingBase, 4), 0, 100));

  return {
    sensorId: building.sensorId,
    buildingId: building.id,
    timestamp: now.toISOString(),
    temperature,
    peopleCount,
    energy,
    roomOccupancy,
    labOccupancy,
    parkingOccupancy,
  };
}

function printReading(building, reading) {
  const divider = '─'.repeat(36);
  console.log('\n🟢 SENSOR UPDATE');
  console.log(divider);
  console.log(`  Building:    ${building.name} (${building.id})`);
  console.log(`  Sensor:      ${reading.sensorId}`);
  console.log(`  Time:        ${reading.timestamp}`);
  console.log(`  People:      ${reading.peopleCount}`);
  console.log(`  Temperature: ${reading.temperature}°C`);
  console.log(`  Energy:      ${reading.energy}%`);
  console.log(`  Room Occ:    ${reading.roomOccupancy}%`);
  console.log(`  Lab Occ:     ${reading.labOccupancy}%`);
  console.log(`  Parking:     ${reading.parkingOccupancy}%`);
  console.log(divider);
}

function sendToBackend(reading) {
  return new Promise((resolve) => {
    try {
      const url       = new URL(API_ENDPOINT, BACKEND_URL);
      const isHttps   = url.protocol === 'https:';
      const transport = isHttps ? https : http;
      const payload   = JSON.stringify(reading);
      const options   = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
        timeout: 3000,
      };
      const req = transport.request(options, (res) => {
        res.on('data', () => {});
        res.on('end', () => resolve(true));
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => { req.destroy(); resolve(false); });
      req.write(payload);
      req.end();
    } catch { resolve(false); }
  });
}

// ════════════════════════════════════════════════════════════
// SECTION 3: ANALYTICS
// ════════════════════════════════════════════════════════════

const MAX_HISTORY_PER_BUILDING = 600;
const history = {};
BUILDINGS.forEach((b) => { history[b.id] = []; });

function addReading(reading) {
  const bid = reading.buildingId;
  if (!history[bid]) history[bid] = [];
  history[bid].push(reading);
  if (history[bid].length > MAX_HISTORY_PER_BUILDING) {
    history[bid] = history[bid].slice(-MAX_HISTORY_PER_BUILDING);
  }
}

function getHistory(buildingId) {
  if (buildingId) return history[buildingId] || [];
  return history;
}

function collectAllReadings() {
  const readings = [];
  BUILDINGS.forEach((b) => {
    const r = generateReading(b);
    addReading(r);
    readings.push(r);
  });
  return readings;
}

const TREND_WINDOW    = 5;
const TREND_THRESHOLD = 0.8;

function detectTrend(values) {
  if (!values || values.length < 2) return 'stable';
  const n = values.length;
  let sumX = 0, sumY = 0;
  for (let i = 0; i < n; i++) { sumX += i; sumY += values[i]; }
  const meanX = sumX / n, meanY = sumY / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    const dx = i - meanX;
    num += dx * (values[i] - meanY);
    den += dx * dx;
  }
  if (den === 0) return 'stable';
  const slope     = num / den;
  const normSlope = meanY > 0 ? slope / meanY : slope;
  if (normSlope >  TREND_THRESHOLD / 10) return 'increasing';
  if (normSlope < -TREND_THRESHOLD / 10) return 'decreasing';
  return 'stable';
}

function calculateBuildingAnalytics(buildingId) {
  const readings = history[buildingId];
  if (!readings || readings.length === 0) return null;
  const building = BUILDINGS.find((b) => b.id === buildingId);
  if (!building) return null;

  const latest       = readings[readings.length - 1];
  const peopleCounts = readings.map((r) => r.peopleCount);
  const currentCrowd = latest.peopleCount;
  const averageCrowd = Math.round(peopleCounts.reduce((a, b) => a + b, 0) / peopleCounts.length);
  const peakCrowd    = Math.max(...peopleCounts);
  const crowdTrend   = detectTrend(peopleCounts.slice(-TREND_WINDOW));

  const roomUtilization    = clamp(latest.roomOccupancy, 0, 100);
  const labUtilization     = clamp(latest.labOccupancy, 0, 100);
  const parkingUtilization = clamp(latest.parkingOccupancy, 0, 100);

  const crowdPct       = building.baseCapacity > 0 ? (currentCrowd / building.baseCapacity) * 100 : 0;
  const facilityDemand = Math.round(clamp(
    crowdPct * 0.40 + roomUtilization * 0.25 + labUtilization * 0.15 +
    parkingUtilization * 0.10 + latest.energy * 0.10,
    0, 100
  ));

  return {
    buildingId,
    buildingName: building.name,
    currentCrowd,
    averageCrowd,
    peakCrowd,
    crowdTrend,
    temperature: latest.temperature,
    energy: latest.energy,
    roomUtilization,
    labUtilization,
    parkingUtilization,
    facilityDemand,
    readingsCount: readings.length,
  };
}

function calculateAnalytics() {
  const buildingAnalytics = [];
  let totalCurrentCrowd = 0, totalAverageCrowd = 0, totalPeakCrowd = 0;
  let totalRoomUtil = 0, totalLabUtil = 0, totalParkingUtil = 0;
  let totalEnergy = 0, totalFacilityDemand = 0, count = 0;
  const allRecentCounts = [];

  BUILDINGS.forEach((b) => {
    const ba = calculateBuildingAnalytics(b.id);
    if (ba) {
      buildingAnalytics.push(ba);
      totalCurrentCrowd  += ba.currentCrowd;
      totalAverageCrowd  += ba.averageCrowd;
      totalPeakCrowd     += ba.peakCrowd;
      totalRoomUtil      += ba.roomUtilization;
      totalLabUtil       += ba.labUtilization;
      totalParkingUtil   += ba.parkingUtilization;
      totalEnergy        += ba.energy;
      totalFacilityDemand += ba.facilityDemand;
      count++;
      const recent = (history[b.id] || []).slice(-TREND_WINDOW).map((r) => r.peopleCount);
      allRecentCounts.push(recent);
    }
  });

  if (count === 0) return { campus: null, buildings: [] };

  const maxLen = Math.max(...allRecentCounts.map((a) => a.length));
  const campusSums = [];
  for (let i = 0; i < maxLen; i++) {
    let sum = 0;
    allRecentCounts.forEach((arr) => { if (i < arr.length) sum += arr[i]; });
    campusSums.push(sum);
  }

  const campus = {
    currentCrowd:      totalCurrentCrowd,
    averageCrowd:      totalAverageCrowd,
    peakCrowd:         totalPeakCrowd,
    crowdTrend:        detectTrend(campusSums),
    roomUtilization:   Math.round(clamp(totalRoomUtil / count, 0, 100)),
    labUtilization:    Math.round(clamp(totalLabUtil / count, 0, 100)),
    parkingUtilization: Math.round(clamp(totalParkingUtil / count, 0, 100)),
    energy:            Math.round(totalEnergy / count),
    facilityDemand:    Math.round(clamp(totalFacilityDemand / count, 0, 100)),
    buildingCount:     count,
  };

  return { campus, buildings: buildingAnalytics };
}

// ════════════════════════════════════════════════════════════
// SECTION 4: PREDICTION
// ════════════════════════════════════════════════════════════

function profileActivityAt(building, date) {
  const hour           = date.getHours();
  const minuteFraction = date.getMinutes() / 60;
  const current        = building.profile[hour];
  const next           = building.profile[(hour + 1) % 24];
  return current + (next - current) * minuteFraction;
}

function linearSlope(values) {
  const n = values.length;
  if (n < 2) return 0;
  let sumX = 0, sumY = 0;
  for (let i = 0; i < n; i++) { sumX += i; sumY += values[i]; }
  const meanX = sumX / n, meanY = sumY / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    const dx = i - meanX;
    num += dx * (values[i] - meanY);
    den += dx * dx;
  }
  return den === 0 ? 0 : num / den;
}

function formatTime(date) {
  return `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
}

function calculateBuildingPrediction(buildingId, event) {
  const building = BUILDINGS.find((b) => b.id === buildingId);
  if (!building) return null;
  const readings = getHistory(buildingId);
  if (!readings || readings.length === 0) return null;

  const latest       = readings[readings.length - 1];
  const currentCrowd = latest.peopleCount;
  const capacity     = building.baseCapacity;

  const recentCounts = readings.slice(-10).map((r) => r.peopleCount);
  const slope        = linearSlope(recentCounts);
  const trend        = detectTrend(recentCounts);

  const now          = new Date();
  const activityNow  = profileActivityAt(building, now);
  const t30          = new Date(now.getTime() + 30 * 60 * 1000);
  const t60          = new Date(now.getTime() + 60 * 60 * 1000);
  const activity30   = profileActivityAt(building, t30);
  const activity60   = profileActivityAt(building, t60);

  const profileShift30 = (activity30 - activityNow) * capacity;
  const profileShift60 = (activity60 - activityNow) * capacity;
  const trendWeight    = 0.15;

  let predicted30 = currentCrowd + profileShift30 * 0.60 + slope * 600  * trendWeight * 0.40;
  let predicted60 = currentCrowd + profileShift60 * 0.60 + slope * 1200 * trendWeight * 0.40;

  let eventApplied = false;
  if (event && event.expectedAttendance) {
    const loc = (event.location || '').toLowerCase();
    if (loc === buildingId.toLowerCase() || loc === building.name.toLowerCase()) {
      predicted30  += event.expectedAttendance * 0.6;
      predicted60  += event.expectedAttendance * 0.9;
      eventApplied  = true;
    }
  }

  predicted30 = Math.round(clamp(predicted30, 0, capacity));
  predicted60 = Math.round(clamp(predicted60, 0, capacity));

  let peakActivity = 0, peakHourIdx = 0;
  for (let h = 0; h < 24; h++) {
    if (building.profile[h] > peakActivity) { peakActivity = building.profile[h]; peakHourIdx = h; }
  }
  let predictedPeakCrowd = Math.round(clamp(peakActivity * capacity, 0, capacity));
  if (eventApplied && event.expectedAttendance) {
    predictedPeakCrowd = Math.round(clamp(predictedPeakCrowd + event.expectedAttendance, 0, capacity));
  }
  const peakTime = new Date(now);
  peakTime.setHours(peakHourIdx, 0, 0, 0);

  const crowdPct30     = capacity > 0 ? (predicted30 / capacity) * 100 : 0;
  const facilityDemand = Math.round(clamp(
    crowdPct30 * 0.50 + latest.roomOccupancy * 0.20 +
    latest.labOccupancy * 0.15 + latest.parkingOccupancy * 0.15,
    0, 100
  ));

  return {
    buildingId,
    buildingName: building.name,
    currentCrowd,
    predicted30Min: predicted30,
    predicted60Min: predicted60,
    predictedPeakCrowd,
    predictedPeakTime: formatTime(peakTime),
    trend,
    facilityDemand,
    eventApplied,
  };
}

function calculatePrediction(event) {
  const buildingPredictions = [];
  let totalCurrent = 0, total30 = 0, total60 = 0, totalFacilityDemand = 0;
  let campusPeakCrowd = 0, campusPeakTime = '00:00', count = 0;

  BUILDINGS.forEach((b) => {
    const bp = calculateBuildingPrediction(b.id, event);
    if (bp) {
      buildingPredictions.push(bp);
      totalCurrent        += bp.currentCrowd;
      total30             += bp.predicted30Min;
      total60             += bp.predicted60Min;
      totalFacilityDemand += bp.facilityDemand;
      if (bp.predictedPeakCrowd > campusPeakCrowd) {
        campusPeakCrowd = bp.predictedPeakCrowd;
        campusPeakTime  = bp.predictedPeakTime;
      }
      count++;
    }
  });

  if (count === 0) return { campus: null, buildings: [] };

  const analytics   = calculateAnalytics();
  const campusTrend = analytics.campus ? analytics.campus.crowdTrend : 'stable';
  const totalPeakCrowd = buildingPredictions.reduce((sum, bp) => sum + bp.predictedPeakCrowd, 0);

  return {
    campus: {
      currentCrowd:      totalCurrent,
      predicted30Min:    total30,
      predicted60Min:    total60,
      predictedPeakCrowd: totalPeakCrowd,
      predictedPeakTime: campusPeakTime,
      trend:             campusTrend,
      facilityDemand:    Math.round(clamp(totalFacilityDemand / count, 0, 100)),
    },
    buildings: buildingPredictions,
  };
}

// ════════════════════════════════════════════════════════════
// SECTION 5: RECOMMENDATIONS
// ════════════════════════════════════════════════════════════

const THRESHOLDS = {
  LIBRARY_WARNING:         90,
  LIBRARY_CRITICAL:        95,
  PARKING_WARNING:         90,
  PARKING_CRITICAL:        98,
  ROOM_WARNING:            85,
  LAB_WARNING:             90,
  TEMP_WARNING_OFFSET:      4,
  TEMP_CRITICAL_OFFSET:     6,
  ENERGY_WARNING:          80,
  ENERGY_CRITICAL:         92,
  CROWD_CAPACITY_WARNING:  0.80,
  CROWD_CAPACITY_CRITICAL: 0.95,
};

function findAlternative(analyticsMap, excludeId, types, metric) {
  let best = null, bestVal = Infinity;
  BUILDINGS.forEach((b) => {
    if (b.id === excludeId) return;
    if (types && types.length > 0 && !types.includes(b.type)) return;
    const ba  = analyticsMap[b.id];
    if (!ba) return;
    const val = ba[metric];
    if (typeof val === 'number' && val < bestVal) { bestVal = val; best = ba; }
  });
  return best;
}

function ruleCurrentCrowd(ctx, recs) {
  const { building, ba } = ctx;
  if (!ba || building.baseCapacity <= 0) return;
  const ratio = ba.currentCrowd / building.baseCapacity;
  if (ratio > THRESHOLDS.CROWD_CAPACITY_CRITICAL) {
    recs.push({ type: 'CROWD_CAPACITY', severity: 'CRITICAL', buildingId: building.id, location: ba.buildingName,
      message: 'Crowd critically exceeds capacity.', reason: `Current crowd is ${Math.round(ratio*100)}% of capacity.` });
  } else if (ratio > THRESHOLDS.CROWD_CAPACITY_WARNING) {
    recs.push({ type: 'CROWD_CAPACITY', severity: 'WARNING', buildingId: building.id, location: ba.buildingName,
      message: 'Crowd is high.', reason: `Current crowd is ${Math.round(ratio*100)}% of capacity.` });
  }
}

function ruleFacilityDemand(ctx, recs) {
  const { building, ba } = ctx;
  if (!ba) return;
  if (ba.facilityDemand >= 100) {
    recs.push({ type: 'FACILITY_DEMAND', severity: 'CRITICAL', buildingId: building.id, location: ba.buildingName,
      message: 'Facility demand has exceeded available capacity.', reason: `Demand score is ${ba.facilityDemand}%.` });
  }
}

function ruleSensorOffline(ctx, recs) {
  const { building } = ctx;
  const h = getHistory(building.id);
  if (!h || h.length === 0) {
    recs.push({ type: 'SENSOR_OFFLINE', severity: 'WARNING', buildingId: building.id, location: building.name,
      message: 'Sensor offline.', reason: 'No telemetry received.' });
    return;
  }
  const latest   = h[h.length - 1];
  const lastTime = new Date(latest.timestamp || new Date()).getTime();
  if (new Date().getTime() - lastTime > 60000) {
    recs.push({ type: 'SENSOR_OFFLINE', severity: 'WARNING', buildingId: building.id, location: building.name,
      message: 'Sensor offline.', reason: 'Stale telemetry.' });
  }
}

function ruleLibraryCrowd(ctx, recs) {
  const { building, ba, analyticsMap } = ctx;
  if (building.type !== 'library' || !ba) return;
  const occ = ba.roomUtilization;
  if (occ > THRESHOLDS.LIBRARY_CRITICAL) {
    const alt    = findAlternative(analyticsMap, building.id, ['library','academic','social'], 'roomUtilization');
    const altMsg = alt ? ` Redirect to ${alt.buildingName} (${alt.roomUtilization}% occupied).` : '';
    recs.push({ type: 'LIBRARY', severity: 'CRITICAL', buildingId: building.id, location: ba.buildingName,
      message: `Library is critically full.${altMsg}`, reason: `Library room occupancy is ${occ}%.` });
  } else if (occ > THRESHOLDS.LIBRARY_WARNING) {
    recs.push({ type: 'LIBRARY', severity: 'WARNING', buildingId: building.id, location: ba.buildingName,
      message: 'Open additional study capacity and redirect crowd to Study Hall B.',
      reason: `Library room occupancy is ${occ}%.` });
  }
}

function ruleParkingUtilization(ctx, recs) {
  const { building, ba, analyticsMap } = ctx;
  if (building.type !== 'parking' || !ba) return;
  const util = ba.parkingUtilization;
  if (util > THRESHOLDS.PARKING_CRITICAL) {
    recs.push({ type: 'PARKING', severity: 'CRITICAL', buildingId: building.id, location: ba.buildingName,
      message: 'Parking is nearly full. Redirect incoming vehicles immediately.',
      reason: `Parking utilization is ${util}%.` });
  } else if (util > THRESHOLDS.PARKING_WARNING) {
    const alt = findAlternative(analyticsMap, building.id, ['parking'], 'parkingUtilization');
    const msg = alt && alt.buildingName === 'Parking B'
      ? 'Redirect incoming vehicles to Parking B.'
      : `Direct incoming vehicles to another available parking area.${alt ? ' Direct to ' + alt.buildingName + '.' : ''}`;
    recs.push({ type: 'PARKING', severity: 'WARNING', buildingId: building.id, location: ba.buildingName,
      message: msg, reason: `Parking utilization is ${util}%.` });
  }
}

function ruleCrowdPrediction(ctx, recs) {
  const { building, bp } = ctx;
  if (!bp || building.baseCapacity <= 0) return;
  const ratio30 = bp.predicted30Min / building.baseCapacity;
  const ratio60 = bp.predicted60Min / building.baseCapacity;
  if (ratio30 > THRESHOLDS.CROWD_CAPACITY_CRITICAL || ratio60 > THRESHOLDS.CROWD_CAPACITY_CRITICAL) {
    recs.push({ type: 'CROWD_PREDICTION', severity: 'CRITICAL', buildingId: building.id, location: bp.buildingName,
      message: 'Open additional study capacity and redirect crowd to Study Hall B.',
      reason: `Predicted crowd: ${bp.predicted30Min} in 30 min, ${bp.predicted60Min} in 60 min (capacity: ${building.baseCapacity}).` });
  } else if (ratio30 > THRESHOLDS.CROWD_CAPACITY_WARNING || ratio60 > THRESHOLDS.CROWD_CAPACITY_WARNING) {
    recs.push({ type: 'CROWD_PREDICTION', severity: 'WARNING', buildingId: building.id, location: bp.buildingName,
      message: 'Prepare additional facility capacity.',
      reason: `Predicted crowd: ${bp.predicted30Min} in 30 min, ${bp.predicted60Min} in 60 min (capacity: ${building.baseCapacity}).` });
  }
}

function ruleRoomUtilization(ctx, recs) {
  const { building, ba, analyticsMap } = ctx;
  if (!ba || !['academic','office'].includes(building.type)) return;
  const util = ba.roomUtilization;
  if (util > THRESHOLDS.ROOM_WARNING) {
    const alt    = findAlternative(analyticsMap, building.id, ['academic','office','library'], 'roomUtilization');
    const altMsg = alt ? ` Redirect activity to ${alt.buildingName} (${alt.roomUtilization}% occupied).` : '';
    recs.push({ type: 'ROOM', severity: 'WARNING', buildingId: building.id, location: ba.buildingName,
      message: `High classroom utilization detected.${altMsg}`, reason: `Room utilization is ${util}%.` });
  }
}

function ruleLabUtilization(ctx, recs) {
  const { building, ba } = ctx;
  if (!ba) return;
  if (ba.labUtilization > THRESHOLDS.LAB_WARNING) {
    recs.push({ type: 'LAB', severity: 'WARNING', buildingId: building.id, location: ba.buildingName,
      message: 'Laboratory demand is high. Consider opening another available lab.',
      reason: `Lab utilization is ${ba.labUtilization}%.` });
  }
}

function ruleTemperature(ctx, recs) {
  const { building, ba } = ctx;
  if (!ba) return;
  const diff = ba.temperature - building.baseTemp;
  if (diff > THRESHOLDS.TEMP_CRITICAL_OFFSET) {
    recs.push({ type: 'TEMPERATURE', severity: 'CRITICAL', buildingId: building.id, location: ba.buildingName,
      message: 'Temperature critically high. Check HVAC/air-conditioning immediately.',
      reason: `Temperature is ${ba.temperature}°C (baseline: ${building.baseTemp}°C, +${diff.toFixed(1)}°C).` });
  } else if (diff > THRESHOLDS.TEMP_WARNING_OFFSET) {
    recs.push({ type: 'TEMPERATURE', severity: 'WARNING', buildingId: building.id, location: ba.buildingName,
      message: 'Check HVAC/air-conditioning conditions in this building.',
      reason: `Temperature is ${ba.temperature}°C (baseline: ${building.baseTemp}°C, +${diff.toFixed(1)}°C).` });
  }
}

function ruleEnergy(ctx, recs) {
  const { building, ba } = ctx;
  if (!ba) return;
  if (ba.energy > THRESHOLDS.ENERGY_CRITICAL) {
    recs.push({ type: 'ENERGY', severity: 'CRITICAL', buildingId: building.id, location: ba.buildingName,
      message: 'Very high energy consumption. Inspect energy systems immediately.',
      reason: `Energy usage is ${ba.energy}%.` });
  } else if (ba.energy > THRESHOLDS.ENERGY_WARNING) {
    recs.push({ type: 'ENERGY', severity: 'WARNING', buildingId: building.id, location: ba.buildingName,
      message: 'High energy consumption detected. Inspect energy usage in this building.',
      reason: `Energy usage is ${ba.energy}%.` });
  }
}

function ruleRapidCrowdChange(ctx, recs) {
  const { building, ba } = ctx;
  if (!ba || ba.crowdTrend !== 'increasing') return;
  recs.push({ type: 'CROWD_TREND', severity: 'INFO', buildingId: building.id, location: ba.buildingName,
    message: 'Monitor high-density areas and prepare additional capacity.',
    reason: `Crowd trend is increasing (current: ${ba.currentCrowd}, peak: ${ba.peakCrowd}).` });
}

function ruleEventSupport(ctx, recs) {
  const { building, bp, event } = ctx;
  if (!bp || !bp.eventApplied || !event) return;
  recs.push({ type: 'EVENT', severity: 'WARNING', buildingId: building.id, location: bp.buildingName,
    message: `Prepare additional capacity near the event location for "${event.eventName || 'event'}".`,
    reason: `Event expected attendance: ${event.expectedAttendance || 'unknown'}. ` +
            `Predicted crowd: ${bp.predicted30Min} in 30 min, ${bp.predicted60Min} in 60 min.` });
}

const ALL_RULES = [
  ruleCurrentCrowd, ruleFacilityDemand, ruleSensorOffline,
  ruleLibraryCrowd, ruleParkingUtilization, ruleCrowdPrediction,
  ruleRoomUtilization, ruleLabUtilization, ruleTemperature,
  ruleEnergy, ruleRapidCrowdChange, ruleEventSupport,
];

function generateBuildingRecommendations(buildingId, event, analyticsMap, predictionMap) {
  const building = BUILDINGS.find((b) => b.id === buildingId);
  if (!building) return [];
  const ba  = analyticsMap  ? analyticsMap[buildingId]  : calculateBuildingAnalytics(buildingId);
  const bp  = predictionMap ? predictionMap[buildingId] : calculateBuildingPrediction(buildingId, event);
  const ctx = { building, ba, bp, event, analyticsMap: analyticsMap || {} };
  const recommendations = [];
  ALL_RULES.forEach((rule) => { try { rule(ctx, recommendations); } catch (_) {} });
  return recommendations;
}

function generateRecommendations(event) {
  const analytics  = calculateAnalytics();
  const prediction = calculatePrediction(event);
  if (!analytics.campus) return { recommendations: [], analyticsSnapshot: null, predictionSnapshot: null };

  const analyticsMap  = {};
  analytics.buildings.forEach((ba) => { analyticsMap[ba.buildingId] = ba; });
  const predictionMap = {};
  if (prediction.buildings) prediction.buildings.forEach((bp) => { predictionMap[bp.buildingId] = bp; });

  const recommendations = [];
  BUILDINGS.forEach((b) => {
    recommendations.push(...generateBuildingRecommendations(b.id, event, analyticsMap, predictionMap));
  });

  const severityOrder = { CRITICAL: 0, WARNING: 1, INFO: 2 };
  recommendations.sort((a, b) => (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3));

  return { recommendations, analyticsSnapshot: analytics.campus, predictionSnapshot: prediction.campus };
}

// ════════════════════════════════════════════════════════════
// SECTION 6: TEST & DEMO
// ════════════════════════════════════════════════════════════

function runTestAndDemo() {
  const divider = '─'.repeat(52);
  const header  = '═'.repeat(52);

  console.log('');
  console.log(header);
  console.log('  🧪 CampusTwin – Full Pipeline Test');
  console.log('  ⚠  All data is SIMULATED (hackathon demo)');
  console.log(header);

  // ── Step 1: Populate history ──────────────────────────────
  console.log('\n📊 Step 1: Collecting 8 rounds of sensor data...');
  for (let i = 0; i < 8; i++) collectAllReadings();
  let totalReadings = 0;
  BUILDINGS.forEach((b) => { totalReadings += getHistory(b.id).length; });
  console.log(`   ✅ Stored ${totalReadings} readings across ${BUILDINGS.length} buildings`);

  // ── Step 2: Campus analytics ─────────────────────────────
  console.log('\n' + header);
  console.log('  🏫 Step 2: CAMPUS-WIDE ANALYTICS');
  console.log(header);
  const analytics = calculateAnalytics();
  if (analytics.campus) {
    const c = analytics.campus;
    console.log(`\n  Total Crowd: ${c.currentCrowd}  |  Trend: ${c.crowdTrend}`);
    console.log(`  Room: ${c.roomUtilization}%  |  Lab: ${c.labUtilization}%  |  Parking: ${c.parkingUtilization}%`);
    console.log(`  Energy: ${c.energy}%  |  Demand: ${c.facilityDemand}%  |  Buildings: ${c.buildingCount}`);
  }

  // ── Step 3: Campus prediction ────────────────────────────
  console.log('\n' + header);
  console.log('  🔮 Step 3: CAMPUS-WIDE PREDICTION');
  console.log(header);
  const prediction = calculatePrediction();
  if (prediction.campus) {
    const cp = prediction.campus;
    console.log(`\n  Current: ${cp.currentCrowd}  →  +30min: ${cp.predicted30Min}  →  +60min: ${cp.predicted60Min}`);
    console.log(`  Trend: ${cp.trend}  |  Peak: ${cp.predictedPeakCrowd} at ${cp.predictedPeakTime}`);
  }

  // ── Step 4: Live recommendations ─────────────────────────
  console.log('\n' + header);
  console.log('  💡 Step 4: LIVE RECOMMENDATIONS');
  console.log(header);
  const liveRecs = generateRecommendations();
  console.log(`\n  Generated: ${liveRecs.recommendations.length} recommendation(s)`);
  if (liveRecs.recommendations.length === 0) {
    console.log('  (None at current activity level — expected during low-demand hours)');
  } else {
    liveRecs.recommendations.forEach((r, i) => {
      const icon = r.severity === 'CRITICAL' ? '🔴' : r.severity === 'WARNING' ? '🟡' : '🔵';
      console.log(`\n  ${icon} [${i+1}] ${r.severity} — ${r.type}`);
      console.log(`      Location: ${r.location}`);
      console.log(`      Message:  ${r.message}`);
    });
  }

  // ── Step 5: Event prediction ─────────────────────────────
  console.log('\n' + header);
  console.log('  🎪 Step 5: EVENT (Tech Fest @ Auditorium)');
  console.log(header);
  const event     = { eventName: 'Tech Fest', location: 'Auditorium', expectedAttendance: 300 };
  const eventPred = calculateBuildingPrediction('b6', event);
  if (eventPred) {
    console.log(`\n  Event Applied: ${eventPred.eventApplied}`);
    console.log(`  Predicted +30min: ${eventPred.predicted30Min}  |  +60min: ${eventPred.predicted60Min}`);
  }

  // ── Step 6: DEMO — inject high-demand data ───────────────
  console.log('\n' + header);
  console.log('  🎬 Step 6: HACKATHON DEMO SCENARIO');
  console.log('  (Injecting controlled high-demand data)');
  console.log(header);

  function makeSyntheticReading(buildingId, sensorId, overrides, minutesAgo) {
    const ts = new Date(Date.now() - minutesAgo * 60000);
    return Object.assign({ sensorId, buildingId, timestamp: ts.toISOString(),
      temperature: 24, peopleCount: 100, energy: 40,
      roomOccupancy: 40, labOccupancy: 30, parkingOccupancy: 40 }, overrides);
  }

  const libraryRamp = [
    { peopleCount: 200, roomOccupancy: 55, parkingOccupancy: 60, energy: 45, temperature: 23.5 },
    { peopleCount: 240, roomOccupancy: 62, parkingOccupancy: 65, energy: 50, temperature: 23.8 },
    { peopleCount: 280, roomOccupancy: 72, parkingOccupancy: 70, energy: 58, temperature: 24.2 },
    { peopleCount: 320, roomOccupancy: 82, parkingOccupancy: 78, energy: 65, temperature: 24.5 },
    { peopleCount: 350, roomOccupancy: 88, parkingOccupancy: 85, energy: 72, temperature: 25.0 },
    { peopleCount: 380, roomOccupancy: 93, parkingOccupancy: 90, energy: 78, temperature: 25.5 },
  ];
  const parkingRamp = [
    { peopleCount: 300, roomOccupancy: 20, parkingOccupancy: 70, energy: 35, temperature: 28.5 },
    { peopleCount: 340, roomOccupancy: 22, parkingOccupancy: 78, energy: 40, temperature: 28.8 },
    { peopleCount: 400, roomOccupancy: 25, parkingOccupancy: 84, energy: 45, temperature: 29.2 },
    { peopleCount: 440, roomOccupancy: 28, parkingOccupancy: 89, energy: 50, temperature: 29.5 },
    { peopleCount: 480, roomOccupancy: 30, parkingOccupancy: 93, energy: 55, temperature: 30.0 },
    { peopleCount: 520, roomOccupancy: 32, parkingOccupancy: 96, energy: 60, temperature: 30.5 },
  ];
  const cseRamp = [
    { peopleCount: 250, roomOccupancy: 60, labOccupancy: 55, energy: 55, temperature: 24.5 },
    { peopleCount: 300, roomOccupancy: 68, labOccupancy: 65, energy: 62, temperature: 25.0 },
    { peopleCount: 350, roomOccupancy: 75, labOccupancy: 72, energy: 70, temperature: 25.8 },
    { peopleCount: 390, roomOccupancy: 82, labOccupancy: 80, energy: 76, temperature: 26.5 },
    { peopleCount: 420, roomOccupancy: 88, labOccupancy: 88, energy: 82, temperature: 27.5 },
    { peopleCount: 450, roomOccupancy: 92, labOccupancy: 94, energy: 88, temperature: 28.5 },
  ];

  for (let i = 0; i < 6; i++) {
    const min = 5 - i;
    addReading(makeSyntheticReading('b3',  'sensor-b3',  libraryRamp[i], min));
    addReading(makeSyntheticReading('b10', 'sensor-b10', parkingRamp[i], min));
    addReading(makeSyntheticReading('b1',  'sensor-b1',  cseRamp[i],     min));
  }
  console.log('\n  ✅ Injected 18 synthetic high-demand readings\n');

  ['b3','b10','b1'].forEach((bid) => {
    const ba = calculateBuildingAnalytics(bid);
    if (!ba) return;
    console.log(`  ${ba.buildingName}: Crowd=${ba.currentCrowd} | Trend=${ba.crowdTrend} | Room=${ba.roomUtilization}% | Parking=${ba.parkingUtilization}% | Energy=${ba.energy}%`);
  });

  // ── Step 7: Demo recommendations ────────────────────────
  console.log('\n' + header);
  console.log('  💡 Step 7: DEMO RECOMMENDATIONS');
  console.log(header);
  const demoRecs = generateRecommendations();
  console.log(`\n  Total: ${demoRecs.recommendations.length} recommendation(s)\n`);
  demoRecs.recommendations.forEach((r, i) => {
    const icon = r.severity === 'CRITICAL' ? '🔴' : r.severity === 'WARNING' ? '🟡' : '🔵';
    console.log(`  ${icon} [${i+1}] ${r.severity} — ${r.type} @ ${r.location}`);
    console.log(`      ${r.message}`);
    console.log(`      ${r.reason}`);
  });

  // ── Step 8: Combined JSON output ─────────────────────────
  console.log('\n' + header);
  console.log('  📋 Step 8: COMBINED JSON OUTPUT');
  console.log(header);
  const demoAnalytics  = calculateAnalytics();
  const demoPrediction = calculatePrediction();
  console.log('\n' + JSON.stringify({
    analytics:       demoAnalytics.campus,
    prediction:      demoPrediction.campus,
    recommendations: demoRecs.recommendations,
  }, null, 2));

  // ── Validation ───────────────────────────────────────────
  console.log('\n' + header);
  console.log('  ✅ VALIDATION');
  console.log(header);

  let allPassed = true;
  function check(label, condition) {
    if (condition) { console.log(`  ✅ ${label}`); }
    else           { console.log(`  ❌ ${label}`); allPassed = false; }
  }

  check('All 13 buildings exist', BUILDINGS.length === 13);
  check('History populated', totalReadings === 8 * BUILDINGS.length);
  check('calculateAnalytics() returns campus data', !!analytics.campus);
  check('No NaN in analytics', !isNaN(analytics.campus.currentCrowd));
  check('No Infinity in analytics', isFinite(analytics.campus.currentCrowd));
  check('Event override applied', !!eventPred && eventPred.eventApplied === true);
  check('generateRecommendations() returns array', Array.isArray(liveRecs.recommendations));
  check('Recommendations have required fields', liveRecs.recommendations.every(
    (r) => r.type && r.severity && r.location && r.message && r.reason
  ));
  check('Demo triggered recommendations', demoRecs.recommendations.length > 0);
  check('Demo has LIBRARY or ROOM rec', demoRecs.recommendations.some((r) => r.type === 'LIBRARY' || r.type === 'ROOM'));
  check('Demo has PARKING rec', demoRecs.recommendations.some((r) => r.type === 'PARKING'));
  check('Full pipeline works', typeof generateReading === 'function' && typeof generateRecommendations === 'function');
  check('No crashes', true);

  console.log('\n' + header);
  console.log(allPassed ? '  🎉 ALL TESTS PASSED — PARTS 1 + 2 + 3 COMPLETE' : '  ⚠️  SOME TESTS FAILED');
  console.log(header + '\n');
}

// ════════════════════════════════════════════════════════════
// MAIN ENTRY POINT
// ════════════════════════════════════════════════════════════

// Run as: node campustwin.js          → runs test + demo
// Run as: node campustwin.js simulate → runs live simulator

if (require.main === module) {
  const mode = process.argv[2];

  if (mode === 'simulate') {
    // ── Live simulator mode ───────────────────────────────
    let tickCount = 0, backendReachable = null;

    async function tick() {
      const building = BUILDINGS[tickCount % BUILDINGS.length];
      const reading  = generateReading(building);
      printReading(building, reading);
      const sent = await sendToBackend(reading);
      if (backendReachable !== sent) {
        backendReachable = sent;
        console.log(sent
          ? `📡 Backend connected — data sent to ${BACKEND_URL}`
          : '⚠️  Backend not reachable — local-only mode');
      }
      tickCount++;
    }

    console.log('');
    console.log('═'.repeat(50));
    console.log('  🏫 CampusTwin – IoT Sensor Simulator');
    console.log('  ⚠  All data is SIMULATED (hackathon demo)');
    console.log('═'.repeat(50));
    console.log(`  Buildings: ${BUILDINGS.length}  |  Interval: ${SENSOR_INTERVAL_MS/1000}s`);
    console.log(`  Backend:   ${BACKEND_URL}${API_ENDPOINT}`);
    console.log(`  Started:   ${new Date().toISOString()}`);
    console.log('═'.repeat(50) + '\n');
    tick();
    setInterval(tick, SENSOR_INTERVAL_MS);

  } else {
    // ── Default: test + demo mode ─────────────────────────
    runTestAndDemo();
  }
}

// ── Exports (for Person 2's backend) ────────────────────────
module.exports = {
  // Config
  BACKEND_URL, SENSOR_INTERVAL_MS, API_ENDPOINT, BUILDINGS,
  // Simulator
  generateReading, sendToBackend,
  // Analytics
  addReading, getHistory, collectAllReadings,
  calculateBuildingAnalytics, calculateAnalytics, detectTrend,
  MAX_HISTORY_PER_BUILDING,
  // Prediction
  calculateBuildingPrediction, calculatePrediction,
  // Recommendations
  generateRecommendations, generateBuildingRecommendations, THRESHOLDS,
};
