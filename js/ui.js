// UI management functions
class UIManager {
    constructor(game) {
        this.game = game;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupPageTransitions();
        this.setupTheme();
    }

    setupNavigation() {
        // Navigation links handling
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetPage = link.getAttribute('data-page');
                this.showPage(targetPage);
                
                // Update active state
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    setupPageTransitions() {
        // Smooth page transitions
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = 'none';
        });
    }

    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show target page
        const targetPage = document.getElementById(`${pageId}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // Update the URL hash for navigation history
        window.location.hash = pageId;
        
        // Trigger custom event for page-specific initialization
        window.dispatchEvent(new CustomEvent('pageChanged', { detail: { pageId } }));
    }

    setupTheme() {
        // Initialize theme based on settings
        const theme = this.game.state.settings.theme;
        this.applyTheme(theme);
    }

    applyTheme(themeName) {
        const body = document.body;
        
        if (themeName === 'dark') {
            body.style.background = 'linear-gradient(135deg, #1a2a6c, #2a4d69)';
        } else {
            body.style.background = 'linear-gradient(135deg, #a8edea, #fed6e3)';
        }
    }

    updateDashboard() {
        // Update all dashboard elements
        document.getElementById('streak-count').textContent = this.game.state.streak;
        document.getElementById('total-xp').textContent = this.game.state.totalXP;
        document.getElementById('productivity-score').textContent = this.game.calculateProductivityScore() + '%';
        
        // Update XP bar
        const xpToNextLevel = (this.game.state.characterLevel * 500) - this.game.state.totalXP;
        const xpPercent = Math.min(100, Math.max(0, (this.game.state.totalXP % 500) / 5));
        document.getElementById('xp-fill').style.width = `${xpPercent}%`;
        document.getElementById('xp-text').textContent = `${this.state.totalXP % 500} / 500 XP to next level`;
        
        // Update streak displays
        document.getElementById('no-porn-streak').textContent = this.game.state.noPornStreak;
        document.getElementById('low-screen-streak').textContent = this.game.state.lowScreenStreak;
        document.getElementById('productivity-streak').textContent = this.game.state.productivityStreak;
        
        // Update character display
        this.updateCharacterDisplay();
        
        // Update world display
        this.updateWorldDisplay();
        
        // Update motivation message
        document.getElementById('motivation-message').textContent = this.game.getMotivationalMessage();
    }

    updateCharacterDisplay() {
        const characterEl = document.getElementById('character');
        const statusEl = document.getElementById('character-status');
        
        if (!characterEl || !statusEl) return;
        
        // Calculate character appearance based on stats
        const avgStreak = (this.game.state.noPornStreak + this.game.state.lowScreenStreak + this.game.state.productivityStreak) / 3;
        const level = this.game.state.characterLevel;
        
        // Reset character styling
        characterEl.style.background = '';
        
        if (avgStreak > 14) {
            // Hero level
            characterEl.innerHTML = '🦸‍♂️';
            characterEl.style.background = 'linear-gradient(135deg, #4cc9f0, #4361ee)';
            characterEl.style.fontSize = '4rem';
            statusEl.textContent = 'Your hero is at peak strength! Keep it up!';
        } else if (avgStreak > 7) {
            // Strong character
            characterEl.innerHTML = '👤💪';
            characterEl.style.background = 'linear-gradient(135deg, #4cc9f0, #3a86ff)';
            characterEl.style.fontSize = '3rem';
            statusEl.textContent = 'Your character grows stronger with discipline!';
        } else if (avgStreak > 3) {
            // Developing character
            characterEl.innerHTML = '👤';
            characterEl.style.background = 'linear-gradient(135deg, #3a86ff, #333)';
            characterEl.style.fontSize = '2.5rem';
            statusEl.textContent = 'Your character is developing through effort!';
        } else {
            // Basic character
            characterEl.innerHTML = '👤';
            characterEl.style.background = 'linear-gradient(135deg, #6a6a6a, #333)';
            characterEl.style.fontSize = '2rem';
            statusEl.textContent = 'Your character is on a journey of growth!';
        }
    }

    updateWorldDisplay() {
        const terrainEl = document.getElementById('terrain');
        const weatherEl = document.getElementById('weather');
        const worldStatusEl = document.getElementById('world-status');
        const terrainImageEl = document.getElementById('terrain-image');
        
        if (!terrainEl || !weatherEl || !worldStatusEl || !terrainImageEl) return;
        
        // Update based on world state
        switch(this.game.state.worldState) {
            case 'bright':
                terrainEl.innerHTML = '<div style="color: #4cc9f0;">☀️ Lush Greenery</div>';
                weatherEl.innerHTML = '<div style="color: #a9d6e5;">Weather: Sunny & Clear</div>';
                worldStatusEl.textContent = 'The world is bright and full of life! Your discipline brings light.';
                terrainImageEl.style.background = 'linear-gradient(135deg, #2a9d8f, #8ac926)';
                terrainImageEl.innerHTML = '🌳🏞️';
                break;
            case 'normal':
                terrainEl.innerHTML = '<div style="color: #e9c46a;">🌿 Decent Landscape</div>';
                weatherEl.innerHTML = '<div style="color: #8d99ae;">Weather: Partly Cloudy</div>';
                worldStatusEl.textContent = 'The world has a balanced atmosphere. Keep making good choices.';
                terrainImageEl.style.background = 'linear-gradient(135deg, #e9c46a, #f4a261)';
                terrainImageEl.innerHTML = '🌾🌄';
                break;
            case 'dim':
                terrainEl.innerHTML = '<div style="color: #f4a261;">枯Dry Terrain</div>';
                weatherEl.innerHTML = '<div style="color: #adb5bd;">Weather: Overcast</div>';
                worldStatusEl.textContent = 'The world appears more challenging now. Remember, setbacks are temporary.';
                terrainImageEl.style.background = 'linear-gradient(135deg, #f4a261, #e76f51)';
                terrainImageEl.innerHTML = '🏜️☁️';
                break;
            case 'dark':
                terrainEl.innerHTML = '<div style="color: #e76f51;">枯Barren Land</div>';
                weatherEl.innerHTML = '<div style="color: #6c757d;">Weather: Stormy</div>';
                worldStatusEl.textContent = 'The world is dark, but there is still hope. One good day can change everything.';
                terrainImageEl.style.background = 'linear-gradient(135deg, #e76f51, #264653)';
                terrainImageEl.innerHTML = '🌫️🌪️';
                break;
        }
    }

    showLogFeedback(xpGained) {
        // Create feedback message
        const feedback = document.createElement('div');
        feedback.className = 'log-feedback';
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(30, 30, 40, 0.95);
            padding: 30px;
            border-radius: 15px;
            border: 2px solid #4cc9f0;
            z-index: 10000;
            text-align: center;
            backdrop-filter: blur(10px);
            max-width: 90%;
            width: 500px;
        `;
        
        feedback.innerHTML = `
            <h3 style="color: #4cc9f0; margin-bottom: 15px; font-size: 1.8rem;">Log Saved!</h3>
            <p style="font-size: 1.2rem; margin: 15px 0; color: #e0e0e0;">You earned <strong style="color: #4cc9f0; font-size: 1.5rem;">${xpGained} XP</strong> today!</p>
            <p style="margin: 15px 0; color: #a9d6e5;">Keep up the great work on your recovery journey!</p>
            <div style="margin-top: 20px;">
                <button id="close-feedback" style="
                    background: #4cc9f0; 
                    color: #0a0a1a; 
                    border: none; 
                    padding: 12px 30px; 
                    border-radius: 8px; 
                    cursor: pointer; 
                    font-size: 1.1rem;
                    font-weight: 500;
                    transition: all 0.3s ease;
                ">Continue Journey</button>
            </div>
        `;
        
        document.body.appendChild(feedback);
        
        // Add close button event
        document.getElementById('close-feedback').addEventListener('click', () => {
            feedback.remove();
        });
        
        // Auto-remove after 5 seconds if not clicked
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.remove();
            }
        }, 5000);
    }

    setupLogPage() {
        const logForm = document.getElementById('habit-log-form');
        if (!logForm) return;
        
        logForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form values
            const noPorn = document.getElementById('no-porn-no').checked;
            const screenTime = parseInt(document.getElementById('screen-time').value) || 0;
            const productivityTask = document.getElementById('productive-task').value || '';
            
            const habits = {
                noPorn: !noPorn, // true if they said "no" to porn
                screenTime: screenTime,
                productivityTask: productivityTask
            };
            
            // Log the habits and get XP gained
            const xpGained = this.game.logHabits(habits);
            
            // Show feedback
            this.showLogFeedback(xpGained);
        });
        
        // Setup screen time slider
        const screenTimeSlider = document.getElementById('screen-time');
        const screenTimeValue = document.getElementById('screen-time-value');
        if (screenTimeSlider && screenTimeValue) {
            screenTimeSlider.addEventListener('input', (e) => {
                screenTimeValue.textContent = `${e.target.value} minutes`;
            });
        }
    }

    setupProgressPage() {
        // Update XP bar
        const xpToNextLevel = (this.game.state.characterLevel * 500) - this.game.state.totalXP;
        const xpPercent = Math.min(100, Math.max(0, (this.game.state.totalXP % 500) / 5));
        document.getElementById('xp-fill').style.width = `${xpPercent}%`;
        document.getElementById('xp-text').textContent = `${this.game.state.totalXP % 500} / 500 XP to next level`;
        
        // Update streak displays
        document.getElementById('no-porn-streak').textContent = this.game.state.noPornStreak;
        document.getElementById('low-screen-streak').textContent = this.game.state.lowScreenStreak;
        document.getElementById('productivity-streak').textContent = this.game.state.productivityStreak;
    }

    setupSettingsPage() {
        // Set up settings events
        const screenTimeLimitEl = document.getElementById('screen-time-limit');
        if (screenTimeLimitEl) {
            screenTimeLimitEl.value = this.game.state.settings.screenTimeLimit;
            screenTimeLimitEl.addEventListener('change', (e) => {
                this.game.state.settings.screenTimeLimit = parseInt(e.target.value);
                this.game.saveState();
            });
        }
        
        const themeEl = document.getElementById('theme');
        if (themeEl) {
            themeEl.value = this.game.state.settings.theme;
            themeEl.addEventListener('change', (e) => {
                this.game.state.settings.theme = e.target.value;
                this.game.saveState();
                this.applyTheme(e.target.value);
            });
        }
        
        const motivationFreqEl = document.getElementById('motivation-frequency');
        if (motivationFreqEl) {
            motivationFreqEl.value = this.game.state.settings.motivationFrequency;
            motivationFreqEl.addEventListener('change', (e) => {
                this.game.state.settings.motivationFrequency = e.target.value;
                this.game.saveState();
            });
        }
        
        const resetDataBtn = document.getElementById('reset-data');
        if (resetDataBtn) {
            resetDataBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all your data? This cannot be undone.')) {
                    this.game.resetData();
                }
            });
        }
        
        const dailyReminderEl = document.getElementById('daily-reminder');
        if (dailyReminderEl) {
            dailyReminderEl.addEventListener('change', (e) => {
                // In a real app, this would set up notifications
                console.log('Daily reminder time set to:', e.target.value);
            });
        }
    }

    setupMapPage() {
        // Update narrative text based on current location and stats
        const narrativeText = document.getElementById('narrative-text');
        if (!narrativeText) return;
        
        // Dynamic narrative based on player's progress
        const avgStreak = (this.game.state.noPornStreak + this.game.state.lowScreenStreak + this.game.state.productivityStreak) / 3;
        
        if (avgStreak > 14) {
            narrativeText.textContent = 'The land glows with your strength. Your discipline has brought peace and prosperity. The people celebrate your unwavering willpower.';
        } else if (avgStreak > 7) {
            narrativeText.textContent = 'The land thrives under your growing discipline. Your journey shows you are developing true strength.';
        } else if (avgStreak > 3) {
            narrativeText.textContent = 'The land responds to your efforts. Though challenges remain, your determination is growing.';
        } else {
            narrativeText.textContent = 'The land reflects your struggle. But remember, every hero faces trials. Your journey has just begun.';
        }
        
        // Add event listeners to location elements
        document.querySelectorAll('.location').forEach(location => {
            location.addEventListener('click', (e) => {
                const locationName = location.getAttribute('data-location');
                this.visitLocation(locationName);
            });
        });
    }

    visitLocation(locationName) {
        // Update current location and show narrative
        this.game.state.currentLocation = locationName;
        this.game.saveState();
        
        const narrativeText = document.getElementById('narrative-text');
        if (narrativeText) {
            switch(locationName) {
                case 'forest':
                    narrativeText.textContent = 'You enter the Forest of Focus. Here, your mind becomes clear and distractions fade away.';
                    break;
                case 'mountain':
                    narrativeText.textContent = 'You climb the Mountain of Discipline. Each step strengthens your willpower and resolve.';
                    break;
                case 'ocean':
                    narrativeText.textContent = 'You reach the Ocean of Calm. The rhythmic waves help center your thoughts and emotions.';
                    break;
                default:
                    narrativeText.textContent = 'You explore this area. The path of recovery has many destinations, each offering its own lessons.';
            }
        }
    }
}

// Initialize UI manager when the game is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for game to initialize first
    const checkGame = setInterval(() => {
        if (window.game) {
            clearInterval(checkGame);
            window.uiManager = new UIManager(window.game);
            
            // Show the initial page (dashboard)
            window.uiManager.showPage('dashboard');
            
            // Set up page-specific initialization
            window.addEventListener('pageChanged', (e) => {
                const pageId = e.detail.pageId;
                
                switch(pageId) {
                    case 'dashboard':
                        window.uiManager.updateDashboard();
                        break;
                    case 'log':
                        window.uiManager.setupLogPage();
                        break;
                    case 'progress':
                        window.uiManager.setupProgressPage();
                        break;
                    case 'map':
                        window.uiManager.setupMapPage();
                        break;
                    case 'settings':
                        window.uiManager.setupSettingsPage();
                        break;
                }
            });
        }
    }, 100);
});