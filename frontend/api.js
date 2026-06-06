// API Helper Functions
// This file handles all communication with the backend

// Determine API base URL - use environment variable or default to backend server
// For development: http://localhost:8000
// For production: Set REACT_APP_API_URL environment variable
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000'
    : (window.location.origin.includes('vercel') 
        ? 'https://your-backend-url.onrender.com' // Replace with your deployed backend URL
        : window.location.origin);

/**
 * Generic fetch wrapper with error handling
 */
async function apiCall(endpoint, options = {}) {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API Call Failed for ${endpoint}:`, error);
        throw error;
    }
}

/**
 * GET /api/sensors
 * Fetch current sensor data (AQI, PM2.5, PM10, CO2, temperature, etc.)
 */
async function getSensorData() {
    try {
        return await apiCall('/api/sensors');
    } catch (error) {
        console.error('Failed to fetch sensor data:', error);
        return null;
    }
}

/**
 * GET /api/bins
 * Fetch all waste bins data
 */
async function getBinsData() {
    try {
        return await apiCall('/api/bins');
    } catch (error) {
        console.error('Failed to fetch bins data:', error);
        return null;
    }
}

/**
 * GET /api/water
 * Fetch water usage data (zones, total, status)
 */
async function getWaterData() {
    try {
        return await apiCall('/api/water');
    } catch (error) {
        console.error('Failed to fetch water data:', error);
        return null;
    }
}

/**
 * POST /api/ai/analyze
 * Get AI analysis of current environmental status
 * @param {Object} sensorContext - Contains aqi, bins_critical, water_liters, co2
 */
async function analyzeEnvironment(sensorContext) {
    try {
        return await apiCall('/api/ai/analyze', {
            method: 'POST',
            body: JSON.stringify(sensorContext),
        });
    } catch (error) {
        console.error('Failed to analyze environment:', error);
        return { analysis: 'Unable to analyze environment data' };
    }
}

/**
 * POST /api/ai/chat
 * Send a message to the AI chatbot
 * @param {string} message - User's message
 */
async function chatWithAI(message) {
    try {
        return await apiCall('/api/ai/chat', {
            method: 'POST',
            body: JSON.stringify({ message }),
        });
    } catch (error) {
        console.error('Failed to chat with AI:', error);
        return { reply: 'Unable to process your message. Please try again.' };
    }
}

/**
 * GET /api/ai/waste-prediction
 * Get AI waste collection prediction
 */
async function getWastePrediction() {
    try {
        return await apiCall('/api/ai/waste-prediction');
    } catch (error) {
        console.error('Failed to get waste prediction:', error);
        return { recommendation: 'Unable to predict waste collection' };
    }
}

/**
 * GET /api/ai/leak-check
 * Get AI leak detection analysis
 */
async function checkForLeaks() {
    try {
        return await apiCall('/api/ai/leak-check');
    } catch (error) {
        console.error('Failed to check for leaks:', error);
        return { leak_detected: false, action: 'Unable to check for leaks' };
    }
}

/**
 * Update display elements with sensor data
 */
function updateSensorDisplay(data) {
    if (!data) return;

    // Update quick stats
    document.getElementById('aqi').textContent = data.aqi || '-';
    document.getElementById('aqi2').textContent = data.aqi || '-';
    document.getElementById('airStatus').textContent = data.air_status || '-';
    document.getElementById('temperature').textContent = data.temperature || '-';
    document.getElementById('co2').textContent = data.co2 || '-';
    document.getElementById('co22').textContent = data.co2 || '-';

    // Update metric bars (0-300 scale for AQI)
    const aqiPercent = Math.min((data.aqi / 300) * 100, 100);
    document.getElementById('aqiFill').style.width = aqiPercent + '%';

    // PM2.5 (0-200 scale)
    const pm25Percent = Math.min((data.pm25 / 200) * 100, 100);
    document.getElementById('pm25').textContent = data.pm25 || '-';
    document.getElementById('pm25Fill').style.width = pm25Percent + '%';

    // PM10 (0-300 scale)
    const pm10Percent = Math.min((data.pm10 / 300) * 100, 100);
    document.getElementById('pm10').textContent = data.pm10 || '-';
    document.getElementById('pm10Fill').style.width = pm10Percent + '%';

    // CO2 (300-1000 scale)
    const co2Percent = Math.min(((data.co2 - 300) / 700) * 100, 100);
    document.getElementById('co2Fill').style.width = co2Percent + '%';

    // Update AQI card color based on status
    updateAQICardColor(data.air_status);
}

/**
 * Update bins display
 */
function updateBinsDisplay(bins) {
    const container = document.getElementById('binsContainer');
    if (!container || !bins) return;

    container.innerHTML = '';

    bins.forEach(bin => {
        const binCard = document.createElement('div');
        binCard.className = `bin-card ${bin.status}`;
        binCard.innerHTML = `
            <div class="bin-id">${bin.id}</div>
            <div class="bin-location">${bin.location}</div>
            <div class="bin-level">${bin.level}%</div>
            <div class="bin-bar">
                <div class="bin-fill" style="width: ${bin.level}%"></div>
            </div>
        `;
        container.appendChild(binCard);
    });
}

/**
 * Update water display
 */
function updateWaterDisplay(water) {
    if (!water) return;

    document.getElementById('zoneA').textContent = water.zone_a || '-';
    document.getElementById('zoneB').textContent = water.zone_b || '-';
    document.getElementById('zoneC').textContent = water.zone_c || '-';
    document.getElementById('zoneTotal').textContent = water.total_liters || '-';
    document.getElementById('waterTotal').textContent = water.total_liters || '-';

    // Update water status
    const statusElement = document.getElementById('waterStatusText');
    if (water.status) {
        statusElement.textContent = water.status.toUpperCase();
        const statusContainer = document.getElementById('waterStatus');

        if (water.status === 'leak_detected') {
            statusContainer.classList.add('leak');
        } else {
            statusContainer.classList.remove('leak');
        }
    }
}

/**
 * Update AQI card color based on air status
 */
function updateAQICardColor(airStatus) {
    const aqiCard = document.getElementById('aqiCard');
    if (!aqiCard) return;

    let color = '#27ae60'; // Good (green)
    if (airStatus === 'Moderate') color = '#f39c12'; // Moderate (orange)
    if (airStatus === 'Unhealthy for sensitive') color = '#e67e22'; // Unhealthy for sensitive (dark orange)
    if (airStatus === 'Unhealthy') color = '#e74c3c'; // Unhealthy (red)

    aqiCard.style.borderLeftColor = color;
    const statValue = aqiCard.querySelector('.stat-value');
    if (statValue) statValue.style.color = color;
}

/**
 * Add message to chat
 */
function addChatMessage(text, isUser = false) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

    const messageP = document.createElement('p');
    messageP.textContent = text;

    messageDiv.appendChild(messageP);
    chatMessages.appendChild(messageDiv);

    // Auto scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Clear chat messages
 */
function clearChat() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.innerHTML = `
            <div class="message bot-message">
                <p>Hello! I'm EcoGuard AI. Ask me anything about your environmental data, waste management, water usage, or air quality!</p>
            </div>
        `;
    }
}
