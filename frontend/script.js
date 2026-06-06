// Main Application Logic
// Initialized on page load

let autoRefreshInterval = null;
let autoRefreshEnabled = true;

// DOM Elements
let elements = {};

/**
 * Initialize the application
 */
function initializeApp() {
    console.log('Initializing EcoGuard Application...');

    // Cache DOM elements
    cacheElements();

    // Set up event listeners
    setupEventListeners();

    // Load initial data
    loadAllData();

    // Start auto-refresh
    startAutoRefresh();

    // Update time display
    updateTimeDisplay();
    setInterval(updateTimeDisplay, 1000);

    // Update last update time
    updateLastUpdateTime();

    console.log('EcoGuard Application initialized successfully');
}

/**
 * Cache frequently accessed DOM elements
 */
function cacheElements() {
    elements = {
        // Tab buttons
        tabButtons: document.querySelectorAll('.tab-button'),
        tabContents: document.querySelectorAll('.tab-content'),

        // Buttons
        analyzeAirBtn: document.getElementById('analyzeAirBtn'),
        predictWasteBtn: document.getElementById('predictWasteBtn'),
        checkLeakBtn: document.getElementById('checkLeakBtn'),
        sendChatBtn: document.getElementById('sendChatBtn'),

        // Input
        chatInput: document.getElementById('chatInput'),
        autoRefresh: document.getElementById('autoRefresh'),

        // Display elements
        timeDisplay: document.getElementById('timeDisplay'),
        lastUpdate: document.getElementById('lastUpdate'),
    };
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Tab navigation
    if (elements.tabButtons) {
        elements.tabButtons.forEach(button => {
            button.addEventListener('click', (e) => handleTabClick(e));
        });
    }

    // Buttons
    if (elements.analyzeAirBtn) {
        elements.analyzeAirBtn.addEventListener('click', analyzeAir);
    }
    if (elements.predictWasteBtn) {
        elements.predictWasteBtn.addEventListener('click', predictWaste);
    }
    if (elements.checkLeakBtn) {
        elements.checkLeakBtn.addEventListener('click', checkLeaks);
    }
    if (elements.sendChatBtn) {
        elements.sendChatBtn.addEventListener('click', sendChat);
    }

    // Chat input - Send on Enter
    if (elements.chatInput) {
        elements.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendChat();
            }
        });
    }

    // Auto-refresh toggle
    if (elements.autoRefresh) {
        elements.autoRefresh.addEventListener('change', (e) => {
            autoRefreshEnabled = e.target.checked;
            if (autoRefreshEnabled) {
                startAutoRefresh();
            } else {
                stopAutoRefresh();
            }
        });
    }
}

/**
 * Handle tab click
 */
function handleTabClick(event) {
    const tabName = event.target.getAttribute('data-tab');
    if (!tabName) return;

    // Hide all tabs
    elements.tabContents.forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all buttons
    elements.tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Add active class to clicked button
    event.target.classList.add('active');
}

/**
 * Load all data from backend
 */
async function loadAllData() {
    console.log('Loading all data from backend...');

    try {
        // Load data in parallel
        const [sensorData, binsData, waterData] = await Promise.all([
            getSensorData(),
            getBinsData(),
            getWaterData(),
        ]);

        // Update displays
        if (sensorData) {
            updateSensorDisplay(sensorData);
        }
        if (binsData) {
            updateBinsDisplay(binsData);
        }
        if (waterData) {
            updateWaterDisplay(waterData);
        }

        updateLastUpdateTime();
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load data. Make sure the backend server is running on http://localhost:8000');
    }
}

/**
 * Start auto-refresh of data
 */
function startAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }

    autoRefreshInterval = setInterval(() => {
        if (autoRefreshEnabled) {
            console.log('Auto-refreshing data...');
            loadAllData();
        }
    }, 5000); // Refresh every 5 seconds
}

/**
 * Stop auto-refresh
 */
function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
}

/**
 * Update time display
 */
function updateTimeDisplay() {
    if (elements.timeDisplay) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
        elements.timeDisplay.textContent = timeString;
    }
}

/**
 * Update last update time
 */
function updateLastUpdateTime() {
    if (elements.lastUpdate) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
        elements.lastUpdate.textContent = timeString;
    }
}

/**
 * Analyze air quality using AI
 */
async function analyzeAir() {
    console.log('Analyzing air quality...');

    const btn = elements.analyzeAirBtn;
    if (!btn) return;

    // Disable button and show loading state
    btn.disabled = true;
    btn.textContent = 'Analyzing...';

    try {
        // Get current sensor data
        const sensorData = await getSensorData();
        if (!sensorData) {
            throw new Error('Unable to fetch sensor data');
        }

        // Get bins data for critical count
        const binsData = await getBinsData();
        const criticalBins = binsData ? binsData.filter(b => b.level >= 80).length : 0;

        // Get water data
        const waterData = await getWaterData();

        // Prepare context for AI
        const context = {
            aqi: sensorData.aqi,
            bins_critical: criticalBins,
            water_liters: waterData ? waterData.total_liters : 0,
            co2: sensorData.co2,
        };

        // Get analysis from AI
        const result = await analyzeEnvironment(context);
        if (result && result.analysis) {
            showAnalysis(result.analysis);
        }
    } catch (error) {
        console.error('Error analyzing air quality:', error);
        showAnalysis('Unable to analyze air quality. Please ensure the backend is running.');
    } finally {
        // Re-enable button
        btn.disabled = false;
        btn.textContent = 'Get AI Analysis';
    }
}

/**
 * Show analysis result
 */
function showAnalysis(text) {
    const analysisBox = document.getElementById('airAnalysis');
    const analysisText = document.getElementById('airAnalysisText');

    if (analysisBox && analysisText) {
        analysisText.textContent = text;
        analysisBox.style.display = 'block';
    }
}

/**
 * Predict waste collection
 */
async function predictWaste() {
    console.log('Predicting waste collection...');

    const btn = elements.predictWasteBtn;
    if (!btn) return;

    // Disable button and show loading state
    btn.disabled = true;
    btn.textContent = 'Predicting...';

    try {
        const result = await getWastePrediction();
        showWastePrediction(result);
    } catch (error) {
        console.error('Error predicting waste:', error);
        showWastePrediction({ recommendation: 'Unable to generate waste prediction.' });
    } finally {
        // Re-enable button
        btn.disabled = false;
        btn.textContent = 'Get Waste Prediction';
    }
}

/**
 * Show waste prediction result
 */
function showWastePrediction(result) {
    const predictionBox = document.getElementById('wastePrediction');
    const predictionText = document.getElementById('wastePredictionText');

    if (!predictionBox || !predictionText) return;

    let html = '';

    if (result.collection_order && result.collection_order.length > 0) {
        html += `<p><strong>Collection Order:</strong> ${result.collection_order.join(' → ')}</p>`;
    }

    if (result.estimated_full_times && Object.keys(result.estimated_full_times).length > 0) {
        html += `<p><strong>Estimated Full Times:</strong><br>`;
        for (const [bin, time] of Object.entries(result.estimated_full_times)) {
            html += `${bin}: ${time}<br>`;
        }
        html += `</p>`;
    }

    if (result.route_savings_percent) {
        html += `<p><strong>Route Savings:</strong> ${result.route_savings_percent}%</p>`;
    }

    if (result.recommendation) {
        html += `<p><strong>Recommendation:</strong> ${result.recommendation}</p>`;
    }

    predictionText.innerHTML = html || 'No prediction data available.';
    predictionBox.style.display = 'block';
}

/**
 * Check for water leaks
 */
async function checkLeaks() {
    console.log('Checking for water leaks...');

    const btn = elements.checkLeakBtn;
    if (!btn) return;

    // Disable button and show loading state
    btn.disabled = true;
    btn.textContent = 'Checking...';

    try {
        const result = await checkForLeaks();
        showLeakAlert(result);
    } catch (error) {
        console.error('Error checking for leaks:', error);
        showLeakAlert({ leak_detected: false, action: 'Unable to check for leaks.' });
    } finally {
        // Re-enable button
        btn.disabled = false;
        btn.textContent = 'Check for Leaks';
    }
}

/**
 * Show leak detection result
 */
function showLeakAlert(result) {
    const leakAlert = document.getElementById('leakAlert');
    const leakText = document.getElementById('leakAlertText');

    if (!leakAlert || !leakText) return;

    let html = '';

    if (result.leak_detected) {
        if (result.zone) {
            html += `<p><strong>Leak Detected in Zone:</strong> ${result.zone}</p>`;
        }
        if (result.severity) {
            html += `<p><strong>Severity:</strong> ${result.severity}</p>`;
        }
    } else {
        html += `<p>✓ No leaks detected. Water system is normal.</p>`;
    }

    if (result.action) {
        html += `<p><strong>Action:</strong> ${result.action}</p>`;
    }

    leakText.innerHTML = html;
    leakAlert.style.display = 'block';
}

/**
 * Send chat message
 */
async function sendChat() {
    const chatInput = elements.chatInput;
    if (!chatInput || !chatInput.value.trim()) return;

    const userMessage = chatInput.value.trim();
    chatInput.value = '';

    // Add user message to chat
    addChatMessage(userMessage, true);

    // Disable send button
    const sendBtn = elements.sendChatBtn;
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';
    }

    try {
        const result = await chatWithAI(userMessage);
        if (result && result.reply) {
            addChatMessage(result.reply, false);
        } else {
            addChatMessage('Sorry, I could not process your message.', false);
        }
    } catch (error) {
        console.error('Error sending chat message:', error);
        addChatMessage('Unable to connect to AI. Please check the backend server.', false);
    } finally {
        // Re-enable send button
        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send';
        }
    }
}

/**
 * Initialize app when DOM is ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

