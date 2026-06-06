// ================================
// API BASE URL CONFIG (FIXED)
// ================================

const API_BASE_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : process.env.REACT_APP_API_URL;

// Debug (REMOVE in production if needed)
console.log("API_BASE_URL:", API_BASE_URL);

// ================================
// GENERIC API CALL WRAPPER
// ================================

async function apiCall(endpoint, options = {}) {
  try {
    if (!API_BASE_URL) {
      throw new Error("API_BASE_URL is not defined. Check environment variables.");
    }

    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API Error ${response.status}: ${text}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Call Failed (${endpoint}):`, error.message);
    throw error;
  }
}

// ================================
// SENSOR DATA
// ================================

export async function getSensorData() {
  try {
    return await apiCall('/api/sensors');
  } catch (error) {
    console.error('Sensor API failed:', error.message);
    return null;
  }
}

// ================================
// BINS DATA
// ================================

export async function getBinsData() {
  try {
    return await apiCall('/api/bins');
  } catch (error) {
    console.error('Bins API failed:', error.message);
    return null;
  }
}

// ================================
// WATER DATA
// ================================

export async function getWaterData() {
  try {
    return await apiCall('/api/water');
  } catch (error) {
    console.error('Water API failed:', error.message);
    return null;
  }
}

// ================================
// AI ANALYSIS
// ================================

export async function analyzeEnvironment(sensorContext) {
  try {
    return await apiCall('/api/ai/analyze', {
      method: 'POST',
      body: JSON.stringify(sensorContext),
    });
  } catch (error) {
    console.error('AI analysis failed:', error.message);
    return { analysis: 'Unable to analyze environment data' };
  }
}

// ================================
// CHAT AI
// ================================

export async function chatWithAI(message) {
  try {
    return await apiCall('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  } catch (error) {
    console.error('Chat API failed:', error.message);
    return { reply: 'Unable to process your message.' };
  }
}

// ================================
// WASTE PREDICTION
// ================================

export async function getWastePrediction() {
  try {
    return await apiCall('/api/ai/waste-prediction');
  } catch (error) {
    console.error('Waste prediction failed:', error.message);
    return { recommendation: 'Unable to predict waste collection' };
  }
}

// ================================
// LEAK CHECK
// ================================

export async function checkForLeaks() {
  try {
    return await apiCall('/api/ai/leak-check');
  } catch (error) {
    console.error('Leak check failed:', error.message);
    return { leak_detected: false, action: 'Unable to check leaks' };
  }
}

// ================================
// UI UPDATE FUNCTIONS
// ================================

export function updateSensorDisplay(data) {
  if (!data) return;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? '-';
  };

  setText('aqi', data.aqi);
  setText('aqi2', data.aqi);
  setText('airStatus', data.air_status);
  setText('temperature', data.temperature);
  setText('co2', data.co2);
  setText('co22', data.co2);

  // AQI bar
  const aqiFill = document.getElementById('aqiFill');
  if (aqiFill && data.aqi) {
    aqiFill.style.width = Math.min((data.aqi / 300) * 100, 100) + '%';
  }

  // PM2.5
  setText('pm25', data.pm25);
  const pm25Fill = document.getElementById('pm25Fill');
  if (pm25Fill && data.pm25) {
    pm25Fill.style.width = Math.min((data.pm25 / 200) * 100, 100) + '%';
  }

  // PM10
  setText('pm10', data.pm10);
  const pm10Fill = document.getElementById('pm10Fill');
  if (pm10Fill && data.pm10) {
    pm10Fill.style.width = Math.min((data.pm10 / 300) * 100, 100) + '%';
  }

  // CO2 bar
  const co2Fill = document.getElementById('co2Fill');
  if (co2Fill && data.co2) {
    co2Fill.style.width = Math.min(((data.co2 - 300) / 700) * 100, 100) + '%';
  }

  updateAQICardColor(data.air_status);
}

// ================================
// BINS UI
// ================================

export function updateBinsDisplay(bins) {
  const container = document.getElementById('binsContainer');
  if (!container || !Array.isArray(bins)) return;

  container.innerHTML = '';

  bins.forEach(bin => {
    const div = document.createElement('div');
    div.className = `bin-card ${bin.status || ''}`;

    div.innerHTML = `
      <div class="bin-id">${bin.id ?? '-'}</div>
      <div class="bin-location">${bin.location ?? '-'}</div>
      <div class="bin-level">${bin.level ?? 0}%</div>
      <div class="bin-bar">
        <div class="bin-fill" style="width:${bin.level ?? 0}%"></div>
      </div>
    `;

    container.appendChild(div);
  });
}

// ================================
// WATER UI
// ================================

export function updateWaterDisplay(water) {
  if (!water) return;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? '-';
  };

  setText('zoneA', water.zone_a);
  setText('zoneB', water.zone_b);
  setText('zoneC', water.zone_c);
  setText('zoneTotal', water.total_liters);
  setText('waterTotal', water.total_liters);

  const statusText = document.getElementById('waterStatusText');
  const statusBox = document.getElementById('waterStatus');

  if (statusText) statusText.textContent = (water.status || '-').toUpperCase();

  if (statusBox) {
    statusBox.classList.toggle('leak', water.status === 'leak_detected');
  }
}

// ================================
// AQI COLOR
// ================================

export function updateAQICardColor(status) {
  const card = document.getElementById('aqiCard');
  if (!card) return;

  let color = '#27ae60';

  if (status === 'Moderate') color = '#f39c12';
  else if (status === 'Unhealthy for sensitive') color = '#e67e22';
  else if (status === 'Unhealthy') color = '#e74c3c';

  card.style.borderLeftColor = color;

  const value = card.querySelector('.stat-value');
  if (value) value.style.color = color;
}

// ================================
// CHAT FUNCTIONS
// ================================

export function addChatMessage(text, isUser = false) {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  const msg = document.createElement('div');
  msg.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

  const p = document.createElement('p');
  p.textContent = text;

  msg.appendChild(p);
  container.appendChild(msg);

  container.scrollTop = container.scrollHeight;
}

export function clearChat() {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  container.innerHTML = `
    <div class="message bot-message">
      <p>Hello! I'm EcoGuard AI. Ask me anything about environment data.</p>
    </div>
  `;
}
