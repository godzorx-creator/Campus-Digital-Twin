# 🏫 CampusTwin – Smart Campus Dashboard

CampusTwin is a fully interactive, real-time digital twin dashboard designed to monitor and manage campus operations. Built as a single-page web application, it provides a unified view of building occupancy, energy consumption, facility health, and live alerts.

## ✨ Features

- 🗺️ **Interactive Campus Map:** Built with Leaflet.js, featuring color-coded, pulsing building markers and a campus boundary polygon. Click any marker for real-time telemetry.
- 📊 **Real-time Analytics:** Uses Chart.js for 24-hour crowd trend line charts and day-over-day energy consumption bar charts.
- 🏢 **Building Telemetry:** Live data for occupancy, temperature, humidity, and power draw, complete with historical sparkline charts.
- 🤖 **AI Chatbot:** Integrated smart assistant to quickly answer questions about parking, occupancy, and energy usage.
- ⚡ **Energy & Facility Monitoring:** Track total campus load, peak usage, and the operational health of critical infrastructure (Wi-Fi, HVAC, Power Grid).
- 🌓 **Theme Customization:** Seamlessly toggle between dark and light modes (preference saved to local storage).
- 🔄 **Live Simulation:** Auto-refresh toggle that simulates real-time IoT sensor telemetry every few seconds.
- 📱 **Responsive Design:** Fully optimized for desktop, tablet, and mobile viewing.

## 🛠️ Tech Stack

**Frontend:**
- HTML5, CSS3, Vanilla JavaScript (ES6+)
- [Leaflet.js](https://leafletjs.com/) (Maps)
- [Chart.js](https://www.chartjs.org/) (Data Visualization)
- Animations via CSS Keyframes & Intersection Observer API

**Backend / Simulation (Included for future scaling):**
- Node.js & Express (`app.js`)
- PostgreSQL database support
- IoT Sensor Simulator & Analytics Engine (`campustwin.js`)

## 🚀 Getting Started

To run the frontend dashboard locally on your machine, you don't need to install any heavy dependencies. 

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/campustwin.js.git
   cd campustwin.js
   ```

2. **Start a local web server:**
   If you have Python installed, you can easily spin up a local server:
   ```bash
   python3 -m http.server 8080
   ```
   *(Alternatively, you can use VS Code's "Live Server" extension, or Node's `http-server`)*

3. **View the Dashboard:**
   Open your browser and navigate to:
   👉 **http://localhost:8080**

## 📂 Project Structure

```text
📦 CampusTwin
 ┣ 📜 index.html        # Main dashboard UI
 ┣ 📜 style.css         # Styling, themes, and animations
 ┣ 📜 script.js         # Client-side logic, charts, and map handling
 ┣ 📜 app.js            # Node.js Express backend (Future API integration)
 ┣ 📜 campustwin.js     # Node.js IoT data simulator & analytics script
 ┗ 📜 README.md         # Project documentation
```

## ⌨️ Keyboard Shortcuts

- `Ctrl/Cmd + K` - Focus the search bar
- `R` - Instantly refresh telemetry data
- `Esc` - Close active dropdowns or the AI Chatbot

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
