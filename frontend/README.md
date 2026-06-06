# EcoGuard Frontend - New HTML/CSS/JS Version

This is the new vanilla HTML, CSS, and JavaScript frontend for the EcoGuard Environmental Monitoring System.

## What's New

✨ **Pure HTML/CSS/JavaScript Frontend** - No build tools, no package dependencies required!

### Technology Stack
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript** - No frameworks or libraries

### Features

#### 📊 Dashboard
- Real-time environmental sensor monitoring
- Quick stats cards for AQI, temperature, CO₂, and water usage
- Color-coded status indicators

#### 🌫️ Air Quality Monitoring
- AQI Index tracking
- PM2.5 and PM10 monitoring
- CO₂ levels display
- AI-powered analysis of air quality

#### 🗑️ Waste Management
- Real-time waste bin levels
- Status indicators (OK, Warning, Critical)
- Waste collection predictions powered by AI
- Optimized collection routes

#### 💧 Water Management
- Zone-based water usage tracking
- Water leak detection powered by AI
- Usage statistics and anomaly detection
- Real-time status updates

#### 🤖 AI Chatbot
- Ask questions about environmental data
- Real-time chat with AI assistant
- Contextual responses based on current sensor data

## Frontend Structure

```
frontend/
├── index.html          # Main HTML file
├── style.css           # All styling
├── api.js             # API client functions
├── script.js          # Main application logic
└── README.md          # This file
```

## File Descriptions

### index.html
The main HTML file containing:
- Page structure and layout
- Tab navigation system
- All UI panels and sections
- Form inputs and buttons

### style.css
Complete styling including:
- Responsive design (mobile, tablet, desktop)
- Color scheme and theme
- Component styling
- Animations and transitions
- Dark mode support ready

### api.js
API client library with functions:
- `getSensorData()` - Fetch air quality sensors
- `getBinsData()` - Fetch waste bins data
- `getWaterData()` - Fetch water usage data
- `analyzeEnvironment()` - Get AI analysis
- `chatWithAI()` - Send chat messages
- `getWastePrediction()` - Get waste prediction
- `checkForLeaks()` - Check for water leaks
- Display update functions

### script.js
Main application logic:
- DOM initialization and caching
- Event listener setup
- Auto-refresh functionality
- Tab navigation
- Data loading and updates
- Chat message handling
- AI interaction management

## API Integration

The frontend communicates with the backend via REST API endpoints:

### Endpoints Used

```
GET  /api/sensors           - Current sensor readings
GET  /api/bins             - Waste bins status
GET  /api/water            - Water usage data
POST /api/ai/analyze       - AI environmental analysis
POST /api/ai/chat          - AI chatbot
GET  /api/ai/waste-prediction - Waste collection prediction
GET  /api/ai/leak-check    - Water leak detection
```

## How to Run

### Step 1: Start Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # On Windows
pip install -r requirements.txt
python main.py
```

Backend will run on `http://localhost:8000`

### Step 2: Open Frontend
Simply navigate to `http://localhost:8000` in your browser!

The backend automatically serves the frontend files.

## Features in Detail

### Real-time Data Updates
- Auto-refresh every 5 seconds (configurable)
- Toggle in Settings panel
- Manual refresh available

### Responsive Design
- Desktop: Full-featured layout
- Tablet: Optimized grid layout
- Mobile: Single column layout with optimized navigation

### Status Indicators
- **Green (OK)**: Normal operation
- **Orange (Warning)**: Attention needed
- **Red (Critical)**: Immediate action required

### AI Integration
- Uses Google Gemini API (via backend)
- Contextual analysis of environmental data
- Predictive insights for waste and water

## Browser Compatibility

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- IE11: ⚠️ Limited support (no CSS Grid)

## Performance

- **Zero Build Time**: Pure HTML/CSS/JS
- **Small Footprint**: < 100KB total (with CSS)
- **Fast Load**: No npm packages to install
- **Responsive**: Smooth animations and transitions

## Customization

### Colors
Edit the CSS variables in `style.css`:
```css
:root {
    --primary-color: #27ae60;
    --secondary-color: #2980b9;
    /* ... more colors ... */
}
```

### Auto-refresh Interval
In `script.js`, change the interval (currently 5000ms):
```javascript
autoRefreshInterval = setInterval(() => {
    // ...
}, 5000); // Change this value
```

### Add New Panels
1. Add HTML section in `index.html`
2. Match the tab structure
3. Add styling to `style.css`
4. Add logic to `script.js`

## API Error Handling

The frontend gracefully handles:
- Backend connection failures
- Missing API keys
- Malformed responses
- Network timeouts

Users receive helpful error messages guiding them to check the backend server.

## Environment Variables

No environment configuration needed for the frontend!

The API URL is automatically determined from the current origin.

## Development Tips

### Console Logging
Development logs are enabled:
```
"Initializing EcoGuard Application..."
"Loading all data from backend..."
```

Open browser console (F12) to see detailed logs.

### Testing
1. Check browser console for errors
2. Verify backend is running
3. Check network tab for API calls
4. Verify JSON responses from `/api/` endpoints

### Debugging
- All API calls logged to console
- DOM caching for performance monitoring
- Timestamp tracking for updates

## Future Enhancements

Possible improvements:
- [ ] Export data as CSV
- [ ] Chart visualizations
- [ ] Mobile app version
- [ ] Offline mode
- [ ] Dark theme toggle
- [ ] Multi-language support
- [ ] Notification system
- [ ] Alert configuration

## License

Same as EcoGuard main project

## Support

For issues or questions:
1. Check backend logs
2. Verify API endpoints responding
3. Check browser console for errors
4. Ensure GEMINI_API_KEY is set in backend

---

**Note**: This frontend is a complete replacement for the React/Vite version and requires no build process!

