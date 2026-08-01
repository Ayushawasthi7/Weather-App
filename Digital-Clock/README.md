# Dig-clock - Advanced Digital Clock Dashboard

Dig-clock is a premium, responsive, feature-rich Digital Clock Web Application built with a glassmorphism dashboard aesthetic. Running entirely on modern web standards (HTML5, CSS3, Vanilla ES6+ JS), it provides a complete time-management and atmosphere hub featuring digital & analog clocks, stopwatches, pomodoro countdowns, timezone managers, interactive alarms with synthesizers, monthly calendars, weather forecasts, and custom theme overrides.

![Dig-clock Dashboard Mockup](assets/screenshots/dashboard_preview.png)

## Key Features

- **Premium Responsive Interface**: Glassmorphism layers with dynamic layout shifting optimized for Desktop, Laptop, Tablet, and Mobile devices (in portrait and landscape orientation).
- **Core Clocks Display**:
  - Combined Digital (Hours:Minutes:Seconds:Milliseconds) and responsive SVG Analog clock.
  - Interactive toggles for 12H/24H formats and millisecond visibility.
  - Dynamic greeting sublines (Good Morning, Afternoon, Evening, Night) adjusted dynamically.
  - Comprehensive astrometric trackers showing current Day of the Year (DOY), Calendar Week, sunrise/sunset estimations, and dynamic moon phases.
- **Atmospheric Integration**:
  - Built-in canvas floating particle engine with custom particle speed/density slider.
  - Weather Card widget integrating OpenWeatherMap (supporting custom cities and api-keys with simulated fallbacks).
  - Motivational Quote of the Day generator (updates once every 24 hours).
- **Stopwatch Widget**: High-fidelity stopwatch powered by high-resolution browser performance metrics (`performance.now()`), displaying millisecond accuracy and scrollable lap records.
- **Countdown & Pomodoro Widget**:
  - Custom countdown input panels with graphical SVG progress rings.
  - Multi-state Pomodoro cycles (Focus, Short Break, Long Break presets) logging active progress history.
- **Alarm Clock Widget**: Set multiple recurring alarms with customizable labels, repeatable weekdays, snoozing (adds +5 minutes), and synth alerts.
- **Web Audio API Synth Engine**: Synthesizes real-time audio (seconds ticking, hover clicks, alarm sirens) natively inside the browser, eliminating external static `.mp3` loading issues.
- **Visual Customizer**:
  - Instantly swap between Dark Mode, Light Mode, System Auto, and Custom styling.
  - Theme Color Pickers to customize accent glow and primary colors.
  - Custom background uploader (supports custom local image uploads).
- **Accessibility & Utilities**:
  - Full keyboard control mapping.
  - In-app canvas screenshots exporter.
  - Dynamic QR Code generator for dashboard sharing.
  - Voice clock speech announcements.
  - Native browser battery status and network latency monitoring.

---

## Keyboard Shortcuts

Control Dig-clock instantly using the following key bindings:

| Key | Action |
| --- | --- |
| `S` | Start / Stop Stopwatch |
| `L` | Log Lap Time |
| `R` | Reset Stopwatch |
| `T` | Toggle 12H / 24H clock format |
| `M` | Toggle Millisecond display |
| `V` | Read time aloud (Speech Synthesis) |
| `F` | Toggle Fullscreen mode |
| `Esc` | Close active modals / Dismiss ringing alarms |

---

## Folder Structure

```text
Digital-Clock/
├── .gitignore
├── LICENSE
├── README.md
├── backend/
│   ├── package.json
│   └── index.js
└── frontend/
    ├── package.json
    ├── index.html
    ├── style.css
    ├── script.js
    └── assets/
```

---

## Installation & Running

The project is split into a frontend and a backend, both using Node.js for dependency management and local development.

### Backend

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Express server (uses nodemon):
   ```bash
   npm run dev
   ```

### Frontend

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

## Technologies Used

- **Markup**: HTML5 (Semantic elements, ARIA role mapping, Inline SVGs)
- **Styling**: Vanilla CSS3 (Custom properties, grid templates, backdrop filter layers, keyframe animations)
- **Scripting**: ECMAScript 6+ (Web Audio API, Canvas 2D Context, LocalStorage API, SpeechSynthesis, Device Battery & Connection APIs)

---

## Future Enhancements

1. **PWA Support**: Service worker caching and installation manifests for offline install prompts.
2. **Local Public Holiday Calendar**: Pulling regional public holidays into the Calendar widget.
3. **Sound Profiles**: Choose different alarm synth melodies (chirps, bells, pulses).

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more details.
