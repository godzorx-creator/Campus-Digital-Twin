/**
 * ============================================================
 *  CampusTwin – Smart Campus Dashboard · Client-Side Script
 *  Full-featured interactive dashboard with 24+ features.
 *  All sensor data is SIMULATED for hackathon demo purposes.
 * ============================================================
 */

(() => {
  'use strict';

  // ══════════════════════════════════════════════════════════
  // SECTION 1: DATA
  // ══════════════════════════════════════════════════════════

  const BUILDINGS = [
    { id: 1, name: 'CSE Block',        type: 'Academic',   lat: 28.6315, lng: 77.3676, occupancy: 72, capacity: 300, temp: 24.1, humidity: 55, power: 142, rooms: 24, status: 'green' },
    { id: 2, name: 'Engineering Block', type: 'Academic',   lat: 28.6322, lng: 77.3690, occupancy: 58, capacity: 400, temp: 23.5, humidity: 52, power: 198, rooms: 32, status: 'green' },
    { id: 3, name: 'Central Library',   type: 'Library',    lat: 28.6308, lng: 77.3682, occupancy: 85, capacity: 200, temp: 22.0, humidity: 48, power: 76,  rooms: 6,  status: 'yellow' },
    { id: 4, name: 'Admin Building',    type: 'Admin',      lat: 28.6300, lng: 77.3670, occupancy: 35, capacity: 150, temp: 23.8, humidity: 50, power: 54,  rooms: 18, status: 'green' },
    { id: 5, name: 'Food Court',        type: 'Cafeteria',  lat: 28.6312, lng: 77.3700, occupancy: 92, capacity: 250, temp: 26.3, humidity: 65, power: 88,  rooms: 3,  status: 'red' },
    { id: 6, name: 'Sports Complex',    type: 'Recreation', lat: 28.6325, lng: 77.3705, occupancy: 40, capacity: 500, temp: 28.5, humidity: 70, power: 110, rooms: 8,  status: 'green' },
    { id: 7, name: 'Main Parking',      type: 'Parking',    lat: 28.6295, lng: 77.3695, occupancy: 90, capacity: 600, temp: 32.0, humidity: 45, power: 22,  rooms: 0,  status: 'red' },
  ];

  const FACILITIES = [
    { name: 'Wi-Fi Network',  status: 'Operational', health: 94 },
    { name: 'CCTV System',    status: 'Operational', health: 98 },
    { name: 'Water Supply',   status: 'Operational', health: 87 },
    { name: 'HVAC System',    status: 'Moderate',    health: 72 },
    { name: 'Power Grid',     status: 'Operational', health: 91 },
    { name: 'Fire Safety',    status: 'Operational', health: 100 },
    { name: 'Elevators',      status: 'Maintenance', health: 55 },
    { name: 'Solar Panels',   status: 'Operational', health: 82 },
  ];

  const ALERTS = [
    { level: 'red',    title: 'Parking lot almost full',         desc: 'Main Parking is at 90% capacity. Consider redirecting traffic to overflow lot.', time: '2 min ago' },
    { level: 'yellow', title: 'Cafeteria crowd exceeds comfort', desc: 'Food Court occupancy is 92%. Air quality may be affected.', time: '8 min ago' },
    { level: 'yellow', title: 'Elevator maintenance required',   desc: 'Engineering Block elevator #2 reported intermittent faults.', time: '18 min ago' },
  ];

  const WEATHER_STATES = [
    { icon: '☀️', temp: '28°C', desc: 'Clear' },
    { icon: '⛅', temp: '26°C', desc: 'Partly cloudy' },
    { icon: '🌧', temp: '23°C', desc: 'Light rain' },
    { icon: '🌤', temp: '27°C', desc: 'Mostly sunny' },
  ];

  const CHATBOT_RESPONSES = {
    occupancy: '📊 Current campus occupancy is 2,847 people. Peak hour is typically 12:00–13:00. Food Court and Main Parking are at high capacity.',
    crowd:     '📊 Current campus occupancy is 2,847 people. Peak hour is typically 12:00–13:00. Food Court and Main Parking are at high capacity.',
    parking:   '🅿️ Main Parking is 90% full (540/600 spots used). I recommend directing visitors to the overflow lot near Sports Complex.',
    energy:    '⚡ Current campus energy load is 684 kW. Today\'s usage is 8.4 MWh, which is 7.7% lower than yesterday. Efficiency rating: 87%.',
    power:     '⚡ Current campus energy load is 684 kW. Today\'s usage is 8.4 MWh, which is 7.7% lower than yesterday. Efficiency rating: 87%.',
    weather:   '🌤 Current weather: Clear, 28°C. No weather alerts for the campus area.',
    library:   '📚 Central Library is at 85% occupancy (170/200). Temperature: 22°C. It\'s moderately crowded — best to visit after 4 PM.',
    cafeteria: '🍽 Food Court is at 92% capacity! Current wait time estimate: 15–20 minutes. Consider visiting after 2 PM for shorter queues.',
    food:      '🍽 Food Court is at 92% capacity! Current wait time estimate: 15–20 minutes. Consider visiting after 2 PM for shorter queues.',
    building:  '🏢 We monitor 7 buildings: CSE Block, Engineering Block, Central Library, Admin Building, Food Court, Sports Complex, and Main Parking. Click any marker on the map for live details!',
    help:      '💡 I can help with: campus occupancy, parking status, energy monitoring, weather, library info, cafeteria status, building details, and facilities health. Just type a keyword!',
    hello:     '👋 Hello! Welcome to CampusTwin AI. How can I help you today? Try asking about occupancy, parking, energy, or any building.',
    hi:        '👋 Hello! Welcome to CampusTwin AI. How can I help you today? Try asking about occupancy, parking, energy, or any building.',
  };
  const CHATBOT_DEFAULT = '🤔 I\'m still learning! Try asking about occupancy, parking, energy, weather, library, cafeteria, or type "help" for options.';

  const TIMELINE_EVENTS = [
    { emoji: '🔵', title: 'Building occupancy updated', buildings: ['CSE Block', 'Engineering Block', 'Admin Building'] },
    { emoji: '🟡', title: 'Parking status changed',     buildings: ['Main Parking'] },
    { emoji: '🟢', title: 'Crowd level decreased',      buildings: ['Central Library', 'Sports Complex'] },
    { emoji: '🔴', title: 'Maintenance alert raised',    buildings: ['Engineering Block', 'CSE Block'] },
    { emoji: '🟡', title: 'High capacity warning',       buildings: ['Food Court', 'Central Library'] },
    { emoji: '🔵', title: 'Energy consumption spike',    buildings: ['CSE Block', 'Engineering Block'] },
    { emoji: '🟢', title: 'Temperature normalized',      buildings: ['Admin Building', 'Sports Complex'] },
  ];

  // ══════════════════════════════════════════════════════════
  // SECTION 2: UTILITY HELPERS
  // ══════════════════════════════════════════════════════════

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  function clamp(val, min, max) { return Math.min(max, Math.max(min, val)); }
  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function statusFromOccupancy(pct) {
    if (pct > 85) return 'red';
    if (pct > 60) return 'yellow';
    return 'green';
  }
  function labelFromStatus(status) {
    return status === 'red' ? 'High load' : status === 'yellow' ? 'Moderate' : 'Normal';
  }
  function progressColor(pct) {
    if (pct >= 80) return 'progress-green';
    if (pct >= 60) return 'progress-yellow';
    return 'progress-red';
  }

  // Animated number counter
  function animateValue(el, start, end, duration, suffix = '') {
    const startTime = performance.now();
    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(start + (end - start) * eased);
      el.textContent = current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // ══════════════════════════════════════════════════════════
  // SECTION 3: LOADING SCREEN
  // ══════════════════════════════════════════════════════════

  function initLoader() {
    const loader = $('#loader');
    if (!loader) return;
    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 600);
    }, 1500);
  }

  // ══════════════════════════════════════════════════════════
  // SECTION 4: STATS CARDS
  // ══════════════════════════════════════════════════════════

  function getTotalPeople() {
    return BUILDINGS.reduce((s, b) => s + Math.round(b.capacity * b.occupancy / 100), 0);
  }
  function getTotalPower() {
    return BUILDINGS.reduce((s, b) => s + b.power, 0);
  }
  function getParkingAvailable() {
    const p = BUILDINGS.find(b => b.name === 'Main Parking');
    return p ? Math.round(p.capacity * (100 - p.occupancy) / 100) : 60;
  }

  function renderStats() {
    const people = getTotalPeople();
    const power = getTotalPower();
    const parking = getParkingAvailable();
    const stats = [
      { icon: '▦', label: 'Total Buildings',   value: 7,       display: '7',          sub: 'Monitored locations' },
      { icon: '◉', label: 'People on Campus',  value: people,  display: people.toLocaleString(), sub: '↑ 12% vs yesterday' },
      { icon: '⚡', label: 'Energy Load',       value: power,   display: power + ' kW', sub: '↑ 4.2% from avg' },
      { icon: '🅿', label: 'Parking Available', value: parking, display: String(parking), sub: 'of 600 spots' },
      { icon: '◈', label: 'Active Facilities', value: 18,      display: '18 / 20',    sub: '2 under maintenance' },
      { icon: '🔔', label: 'Open Alerts',       value: ALERTS.length, display: String(ALERTS.length), sub: '1 critical' },
    ];
    const el = $('#stats');
    if (!el) return;
    el.innerHTML = stats.map((s, i) => `
      <div class="stat" style="animation: fadeIn 0.5s ease ${i * 0.08}s both">
        <small>${s.label}</small><span class="icon">${s.icon}</span>
        <b data-target="${s.value}">${s.display}</b><span>${s.sub}</span>
      </div>
    `).join('');
  }

  // ══════════════════════════════════════════════════════════
  // SECTION 5: LEAFLET MAP
  // ══════════════════════════════════════════════════════════

  let map, markers = [];

  function initMap() {
    map = L.map('map', { zoomControl: false }).setView([28.6310, 77.3688], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Draw campus boundary polygon
    const polyCoords = BUILDINGS.map(b => [b.lat, b.lng]);
    L.polygon(polyCoords, {
      color: '#38bdf8',
      weight: 1,
      opacity: 0.3,
      fillColor: '#38bdf8',
      fillOpacity: 0.05,
      dashArray: '5, 8',
    }).addTo(map);

    // Add building markers
    BUILDINGS.forEach(b => {
      const color = b.status === 'green' ? '#34d399' : b.status === 'yellow' ? '#fbbf24' : '#fb7185';
      const icon = L.divIcon({
        className: '',
        html: `
          <div style="position:relative">
            <div class="marker-pulse" style="background:${color}40"></div>
            <div style="width:18px;height:18px;background:${color};border:2px solid #fff;border-radius:50%;box-shadow:0 0 12px ${color}80;cursor:pointer;position:relative;z-index:2"></div>
          </div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      const marker = L.marker([b.lat, b.lng], { icon }).addTo(map);
      marker.bindTooltip(b.name, { direction: 'top', offset: [0, -14] });
      marker.on('click', () => {
        map.flyTo([b.lat, b.lng], 17, { duration: 0.8 });
        showDetails(b);
      });
      markers.push(marker);
    });
  }

  // ══════════════════════════════════════════════════════════
  // SECTION 6: BUILDING DETAILS PANEL
  // ══════════════════════════════════════════════════════════

  let detailChart = null;

  function showDetails(b) {
    const pct = b.occupancy;
    const status = statusFromOccupancy(pct);
    const label = labelFromStatus(status);

    const bTitle = $('#bTitle');
    const bSub = $('#bSub');
    const bStatus = $('#bStatus');
    const details = $('#details');
    if (!bTitle || !details) return;

    bTitle.textContent = b.name;
    bSub.textContent = `${b.type} · ${b.rooms} rooms`;
    bStatus.textContent = label;
    bStatus.className = 'badge ' + status;

    const gradColor = status === 'green' ? 'linear-gradient(90deg,#0ea5e9,#22d3ee)'
                    : status === 'yellow' ? 'linear-gradient(90deg,#fbbf24,#f59e0b)'
                    : 'linear-gradient(90deg,#fb7185,#f43f5e)';

    // Generate 12 historical data points for sparkline
    const history = Array.from({ length: 12 }, () => clamp(pct + rand(-20, 20), 5, 100));
    history.push(pct);

    details.innerHTML = `
      <div class="detailhero">
        <b>${pct}% Occupancy</b>
        <small>${Math.round(b.capacity * pct / 100)} / ${b.capacity} people</small>
        <div class="progress" style="margin-top:8px"><i style="width:${pct}%;background:${gradColor}" class="progress-bar-anim"></i></div>
      </div>
      <div class="detailgrid">
        <div class="detailitem" style="animation-delay:0.05s">
          <small>🌡 Temperature</small><b>${b.temp} °C</b>
          <i>${b.temp < 25 ? '✓ Comfortable' : '⚠ Warm'}</i>
        </div>
        <div class="detailitem" style="animation-delay:0.1s">
          <small>💧 Humidity</small><b>${b.humidity}%</b>
          <i>${b.humidity < 60 ? '✓ Normal' : '⚠ High'}</i>
        </div>
        <div class="detailitem" style="animation-delay:0.15s">
          <small>⚡ Power Draw</small><b>${b.power} kW</b>
          <i>Real-time load</i>
        </div>
        <div class="detailitem" style="animation-delay:0.2s">
          <small>🏠 Rooms</small><b>${b.rooms}</b>
          <i>${b.rooms > 0 ? 'Active rooms' : 'Open area'}</i>
        </div>
      </div>
      <div class="detail-chart"><canvas id="detailSparkline"></canvas></div>
    `;

    // Render sparkline chart
    setTimeout(() => {
      const canvas = $('#detailSparkline');
      if (!canvas) return;
      if (detailChart) detailChart.destroy();
      const ctx = canvas.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 0, 80);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.3)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
      detailChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: history.map((_, i) => ''),
          datasets: [{
            data: history,
            borderColor: '#38bdf8',
            backgroundColor: grad,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 1.5,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: { x: { display: false }, y: { display: false, min: 0, max: 100 } },
          animation: { duration: 800 },
        },
      });
    }, 50);
  }

  // ══════════════════════════════════════════════════════════
  // SECTION 7: CROWD CHART
  // ══════════════════════════════════════════════════════════

  let crowdChart;
  const crowdData = [40, 32, 25, 18, 15, 22, 65, 180, 290, 340, 370, 400, 412, 380, 350, 320, 280, 220, 160, 120, 90, 70, 55, 45];

  function initCrowdChart() {
    const labels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
    const ctx = $('#crowdChart')?.getContext('2d');
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, 0, 250);
    grad.addColorStop(0, 'rgba(14, 165, 233, 0.35)');
    grad.addColorStop(1, 'rgba(14, 165, 233, 0.0)');

    crowdChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: [...crowdData],
          borderColor: '#38bdf8',
          backgroundColor: grad,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#38bdf8',
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0e1c2f',
            borderColor: '#203149',
            borderWidth: 1,
            titleFont: { size: 10 },
            bodyFont: { size: 10 },
            callbacks: { label: ctx => `${ctx.raw} people` }
          }
        },
        scales: {
          x: { ticks: { color: '#65778d', font: { size: 8 }, maxTicksLimit: 12 }, grid: { color: '#1a2a40' } },
          y: { ticks: { color: '#65778d', font: { size: 8 } }, grid: { color: '#1a2a40' }, beginAtZero: true },
        },
        animation: { duration: 1000, easing: 'easeOutQuart' },
      },
    });

    // Update summary values
    updateCrowdSummary();
  }

  function updateCrowdSummary() {
    const data = crowdChart ? crowdChart.data.datasets[0].data : crowdData;
    const peak = Math.max(...data);
    const avg = Math.round(data.reduce((a, b) => a + b, 0) / data.length);
    const now = new Date().getHours();
    const current = data[now] || data[12];

    const peakEl = $('#peak');
    const currentEl = $('#current');
    const avgEl = $('#avg');
    if (peakEl) peakEl.innerHTML = `${peak}<small>Peak crowd</small>`;
    if (currentEl) currentEl.textContent = current;
    if (avgEl) avgEl.textContent = avg;
  }

  // ══════════════════════════════════════════════════════════
  // SECTION 8: ENERGY CHART
  // ══════════════════════════════════════════════════════════

  let energyChart;

  function initEnergyChart() {
    const labels = ['00', '03', '06', '09', '12', '15', '18', '21'];
    const today = [310, 280, 350, 560, 780, 912, 850, 684];
    const yesterday = [340, 300, 380, 600, 820, 910, 870, 720];

    const ctx = $('#energyChart')?.getContext('2d');
    if (!ctx) return;

    energyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Today',     data: today,     backgroundColor: '#0ea5e9cc', borderRadius: 4, borderSkipped: false },
          { label: 'Yesterday', data: yesterday,  backgroundColor: '#1e3a5f88', borderRadius: 4, borderSkipped: false },
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#8192a8', font: { size: 8 }, usePointStyle: true, pointStyle: 'rectRounded' } },
          tooltip: {
            backgroundColor: '#0e1c2f',
            borderColor: '#203149',
            borderWidth: 1,
            callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.raw} kW` }
          }
        },
        scales: {
          x: { ticks: { color: '#65778d', font: { size: 8 } }, grid: { display: false } },
          y: { ticks: { color: '#65778d', font: { size: 8 } }, grid: { color: '#1a2a40' }, beginAtZero: true },
        },
        animation: { duration: 1000, easing: 'easeOutQuart' },
      },
    });
  }

  // ══════════════════════════════════════════════════════════
  // SECTION 9: FACILITIES
  // ══════════════════════════════════════════════════════════

  function renderFacilities() {
    const el = $('#facilityList');
    if (!el) return;
    el.innerHTML = FACILITIES.map((f, i) => {
      const color = progressColor(f.health);
      return `
        <div class="facility" style="animation: fadeIn 0.4s ease ${i * 0.05}s both">
          <b>${f.name}</b>
          <small>${f.status} · ${f.health}%</small>
          <div class="progress"><i style="width:${f.health}%" class="${color}"></i></div>
        </div>`;
    }).join('');
  }

  // ══════════════════════════════════════════════════════════
  // SECTION 10: ALERTS
  // ══════════════════════════════════════════════════════════

  function renderAlerts() {
    const el = $('#alerts');
    if (!el) return;
    if (ALERTS.length === 0) {
      el.innerHTML = '<div class="empty"><p>All alerts have been reviewed ✓</p></div>';
      const count = $('#alertCount');
      if (count) count.textContent = '0 active';
      return;
    }
    el.innerHTML = ALERTS.map((a, i) => `
      <div class="alert" style="animation: fadeIn 0.4s ease ${i * 0.1}s both">
        <b>${a.level === 'red' ? '🔴' : '🟡'} ${a.title}</b>
        <small>${a.desc}<br>${a.time}</small>
      </div>
    `).join('');
  }

  // ══════════════════════════════════════════════════════════
  // SECTION 11: BUILDINGS TABLE
  // ══════════════════════════════════════════════════════════

  function renderTable() {
    const el = $('#table');
    if (!el) return;
    let html = `<div class="row head"><span>Building</span><span>Type</span><span>Occupancy</span><span>Status</span><span>Power</span></div>`;
    BUILDINGS.forEach(b => {
      const status = statusFromOccupancy(b.occupancy);
      const label = labelFromStatus(status);
      html += `
        <div class="row" data-id="${b.id}">
          <span><i class="dot ${status}"></i><b>${b.name}</b></span>
          <span>${b.type}</span>
          <span>${b.occupancy}%</span>
          <span><span class="rowstatus ${status}">${label}</span></span>
          <span>${b.power} kW</span>
        </div>`;
    });
    el.innerHTML = html;

    // Click rows to show details
    el.querySelectorAll('.row:not(.head)').forEach(row => {
      row.addEventListener('click', () => {
        const b = BUILDINGS.find(x => x.id === +row.dataset.id);
        if (b) {
          showDetails(b);
          map?.flyTo([b.lat, b.lng], 17, { duration: 0.8 });
          $('#mapSection')?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // ══════════════════════════════════════════════════════════
  // SECTION 12: CLOCK
  // ══════════════════════════════════════════════════════════

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function updateClock() {
    const d = new Date();
    const time = [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, '0')).join(':');
    const date = `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    const el = $('#clock');
    if (el) el.textContent = `${time} · ${date}`;
  }

  // ══════════════════════════════════════════════════════════
  // SECTION 13: SIDEBAR
  // ══════════════════════════════════════════════════════════

  function initSidebar() {
    const sidebar = $('#sidebar');
    const overlay = $('#overlay');
    const open = () => { sidebar?.classList.add('open'); overlay?.classList.add('show'); };
    const close = () => { sidebar?.classList.remove('open'); overlay?.classList.remove('show'); };

    $('#menu')?.addEventListener('click', open);
    $('#close')?.addEventListener('click', close);
    overlay?.addEventListener('click', close);

    $$('nav a').forEach(a => {
      a.addEventListener('click', () => {
        $$('nav a').forEach(x => x.classList.remove('active'));
        a.classList.add('active');
        close();
      });
    });
  }

  // ══════════════════════════════════════════════════════════
  // SECTION 14: DROPDOWNS
  // ══════════════════════════════════════════════════════════

  function initDropdowns() {
    const notifDrop = $('#notifications');
    const profDrop = $('#profileDrop');

    $('#notify')?.addEventListener('click', e => {
      e.stopPropagation();
      notifDrop?.classList.toggle('show');
      profDrop?.classList.remove('show');
    });
    $('#profile')?.addEventListener('click', e => {
      e.stopPropagation();
      profDrop?.classList.toggle('show');
      notifDrop?.classList.remove('show');
    });
    document.addEventListener('click', () => {
      notifDrop?.classList.remove('show');
      profDrop?.classList.remove('show');
    });
  }

  // ══════════════════════════════════════════════════════════
  // SECTION 15: THEME TOGGLE
  // ══════════════════════════════════════════════════════════

  function initTheme() {
    const btn = $('#theme');
    // Restore saved preference
    if (localStorage.getItem('ct-theme') === 'light') {
      document.body.classList.add('light');
      if (btn) btn.textContent = 'Toggle dark mode';
    }
    btn?.addEventListener('click', () => {
      document.body.classList.toggle('light');
      const isLight = document.body.classList.contains('light');
      btn.textContent = isLight ? 'Toggle dark mode' : 'Toggle light mode';
      localStorage.setItem('ct-theme', isLight ? 'light' : 'dark');
    });
  }

  // ══════════════════════════════════════════════════════════
  // SECTION 16: SEARCH
  // ══════════════════════════════════════════════════════════

  function initSearch() {
    const input = $('#search');
    input?.addEventListener('input', () => {
      const q = input.value.toLowerCase().trim();
      // Filter table rows
      $$('#table .row:not(.head)').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
      // Filter facility cards
      $$('#facilityList .facility').forEach(card => {
        card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }

  // ══════════════════════════════════════════════════════════
  // SECTION 17: TOAST NOTIFICATIONS
  // ══════════════════════════════════════════════════════════

  let toastTimeout;
  function showToast(title = 'Data refreshed', msg = 'Campus telemetry is up to date.', type = 'success') {
    const toast = $('#toast');
    if (!toast) return;
    const titleEl = $('#toastTitle');
    const msgEl = $('#toastMsg');
    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = msg;

    toast.className = '';  // reset classes
    if (type === 'warning') toast.classList.add('warning');
    else if (type === 'info') toast.classList.add('info');

    clearTimeout(toastTimeout);
    // Force reflow for re-animation
    void toast.offsetWidth;
    toast.classList.add('show');
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
  }

  // ══════════════════════════════════════════════════════════
  // SECTION 18: REFRESH ACTIONS
  // ══════════════════════════════════════════════════════════

  function refreshBuildingData() {
    BUILDINGS.forEach(b => {
      b.occupancy = clamp(b.occupancy + rand(-5, 5), 5, 98);
      b.temp = +(b.temp + (Math.random() - 0.5) * 0.8).toFixed(1);
      b.power = Math.max(10, b.power + rand(-10, 10));
      b.humidity = clamp(b.humidity + rand(-3, 3), 20, 95);
      b.status = statusFromOccupancy(b.occupancy);
    });
  }

  function initRefresh() {
    $('#refresh')?.addEventListener('click', () => {
      refreshBuildingData();
      renderStats();
      renderTable();
      showToast('Data refreshed', 'Campus telemetry is up to date.', 'success');
    });

    $('#facRefresh')?.addEventListener('click', () => {
      FACILITIES.forEach(f => {
        f.health = clamp(f.health + rand(-5, 5), 20, 100);
        f.status = f.health > 80 ? 'Operational' : f.health > 60 ? 'Moderate' : 'Maintenance';
      });
      renderFacilities();
      showToast('Facilities updated', 'Infrastructure health data refreshed.', 'info');
    });

    $('#review')?.addEventListener('click', () => {
      ALERTS.length = 0;
      renderAlerts();
      showToast('Alerts reviewed', 'All alerts have been marked as reviewed.', 'success');
    });
  }

  // ══════════════════════════════════════════════════════════
  // SECTION 19: SETTINGS
  // ══════════════════════════════════════════════════════════

  let autoInterval;

  function initSettings() {
    const autoToggle = $('#auto');
    const compactToggle = $('#compact');

    function startAutoRefresh() {
      autoInterval = setInterval(() => {
        refreshBuildingData();
        renderStats();
        // Update current hour in crowd chart
        if (crowdChart) {
          const hour = new Date().getHours();
          crowdChart.data.datasets[0].data[hour] = getTotalPeople();
          crowdChart.update('none');
          updateCrowdSummary();
        }
        // Update energy load display
        const eLoad = $('#eLoad');
        if (eLoad) eLoad.innerHTML = `${getTotalPower()} <i>kW</i>`;
      }, 8000);
    }

    if (autoToggle?.checked) startAutoRefresh();
    autoToggle?.addEventListener('change', e => {
      if (e.target.checked) {
        startAutoRefresh();
        showToast('Auto-refresh enabled', 'Data updates every 8 seconds.', 'info');
      } else {
        clearInterval(autoInterval);
        showToast('Auto-refresh paused', 'Manual refresh mode active.', 'warning');
      }
    });

    compactToggle?.addEventListener('change', e => {
      document.body.classList.toggle('compact', e.target.checked);
    });
  }

  // ══════════════════════════════════════════════════════════
  // SECTION 20: WEATHER WIDGET
  // ══════════════════════════════════════════════════════════

  let weatherIndex = 0;

  function initWeather() {
    function update() {
      const w = WEATHER_STATES[weatherIndex % WEATHER_STATES.length];
      const icon = $('#weatherIcon');
      const temp = $('#weatherTemp');
      const desc = $('#weatherDesc');
      if (icon) icon.textContent = w.icon;
      if (temp) temp.textContent = w.temp;
      if (desc) desc.textContent = w.desc;
      weatherIndex++;
    }
    update();
    setInterval(update, 30000);
  }

  // ══════════════════════════════════════════════════════════
  // SECTION 21: AI CHATBOT
  // ══════════════════════════════════════════════════════════

  function initChatbot() {
    const toggle = $('#chatToggle');
    const panel = $('#chatPanel');
    const closeBtn = $('#chatClose');
    const input = $('#chatInput');
    const sendBtn = $('#chatSend');
    const messages = $('#chatMessages');

    if (!toggle || !panel) return;

    toggle.addEventListener('click', () => panel.classList.toggle('open'));
    closeBtn?.addEventListener('click', () => panel.classList.remove('open'));

    function addMessage(text, type = 'bot') {
      const div = document.createElement('div');
      div.className = `chat-msg ${type}`;
      div.innerHTML = `<p>${text}</p>`;
      messages?.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
      return div;
    }

    function getBotResponse(userMsg) {
      const lower = userMsg.toLowerCase();
      for (const [key, response] of Object.entries(CHATBOT_RESPONSES)) {
        if (lower.includes(key)) return response;
      }
      return CHATBOT_DEFAULT;
    }

    function sendMessage() {
      const text = input?.value.trim();
      if (!text) return;
      addMessage(text, 'user');
      input.value = '';

      // Show typing indicator
      const typing = addMessage('...', 'bot');
      typing.classList.add('typing');

      setTimeout(() => {
        typing.remove();
        addMessage(getBotResponse(text), 'bot');
      }, 600 + Math.random() * 400);
    }

    sendBtn?.addEventListener('click', sendMessage);
    input?.addEventListener('keydown', e => {
      if (e.key === 'Enter') sendMessage();
    });
  }

  // ══════════════════════════════════════════════════════════
  // SECTION 22: SCROLL TO TOP
  // ══════════════════════════════════════════════════════════

  function initScrollTop() {
    const btn = $('#scrollTop');
    if (!btn) return;

    const mainEl = $('main');
    (mainEl || window).addEventListener('scroll', () => {
      const scrollY = mainEl ? mainEl.scrollTop : window.scrollY;
      btn.classList.toggle('show', scrollY > 300);
    }, { passive: true });

    // Also listen on window
    window.addEventListener('scroll', () => {
      btn.classList.toggle('show', window.scrollY > 300);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ══════════════════════════════════════════════════════════
  // SECTION 23: SCROLL ANIMATIONS (AOS-like)
  // ══════════════════════════════════════════════════════════

  function initAOS() {
    const elements = $$('[data-aos]');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
          observer.unobserve(entry.target); // animate once only
        }
      });
    }, { threshold: 0.1 });

    elements.forEach(el => observer.observe(el));
  }

  // ══════════════════════════════════════════════════════════
  // SECTION 24: LIVE TIMELINE
  // ══════════════════════════════════════════════════════════

  function initTimeline() {
    const timeline = $('#timeline');
    if (!timeline) return;

    setInterval(() => {
      const event = pick(TIMELINE_EVENTS);
      const building = pick(event.buildings);
      const p = document.createElement('p');
      p.className = 'new-event';
      p.innerHTML = `${event.emoji} <b>${event.title}</b><small>Just now · ${building}</small>`;

      timeline.insertBefore(p, timeline.firstChild);

      // Keep max 5 events
      while (timeline.children.length > 5) {
        timeline.removeChild(timeline.lastChild);
      }
    }, 20000);
  }

  // ══════════════════════════════════════════════════════════
  // SECTION 25: KEYBOARD SHORTCUTS
  // ══════════════════════════════════════════════════════════

  function initKeyboard() {
    document.addEventListener('keydown', e => {
      const search = $('#search');
      const isTyping = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';

      // Ctrl/Cmd + K → focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        search?.focus();
        return;
      }

      // Escape → close dropdowns & chatbot
      if (e.key === 'Escape') {
        $('#notifications')?.classList.remove('show');
        $('#profileDrop')?.classList.remove('show');
        $('#chatPanel')?.classList.remove('open');
        search?.blur();
        return;
      }

      // R → refresh (when not typing in an input)
      if (e.key === 'r' && !isTyping) {
        refreshBuildingData();
        renderStats();
        renderTable();
        showToast('Data refreshed', 'Keyboard shortcut: R', 'info');
      }
    });
  }

  // ══════════════════════════════════════════════════════════
  // SECTION 26: BOOT
  // ══════════════════════════════════════════════════════════

  document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    renderStats();
    initMap();
    initCrowdChart();
    initEnergyChart();
    renderFacilities();
    renderAlerts();
    renderTable();
    initSidebar();
    initDropdowns();
    initTheme();
    initSearch();
    initRefresh();
    initSettings();
    initWeather();
    initChatbot();
    initScrollTop();
    initAOS();
    initTimeline();
    initKeyboard();
    updateClock();
    setInterval(updateClock, 1000);

    console.log('🏫 CampusTwin Dashboard loaded successfully!');
  });

})();
