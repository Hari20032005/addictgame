// Game state management
class Game {
    constructor() {
        this.state = this.loadState();
        this.init();
    }

    init() {
        this.updateUI();
        this.setupEventListeners();
    }

    loadState() {
        const saved = localStorage.getItem('addictGameSave');
        if (saved) {
            return JSON.parse(saved);
        } else {
            // Default state
            return {
                totalXP: 0,
                streak: 0,
                noPornStreak: 0,
                lowScreenStreak: 0,
                productivityStreak: 0,
                lastLogDate: null,
                habits: {
                    noPorn: true,
                    screenTime: 0,
                    productivityTask: ''
                },
                settings: {
                    screenTimeLimit: 120,
                    theme: 'dark',
                    motivationFrequency: 'medium'
                },
                achievements: [],
                worldState: 'bright', // bright, dim, dark
                characterLevel: 1,
                currentLocation: 'village'
            };
        }
    }

    saveState() {
        localStorage.setItem('addictGameSave', JSON.stringify(this.state));
    }

    logHabits(habits) {
        const today = new Date().toDateString();
        const wasYesterday = this.state.lastLogDate === new Date(Date.now() - 86400000).toDateString();
        
        // Update habits
        this.state.habits = habits;
        this.state.lastLogDate = today;

        // Calculate rewards
        let xpGained = 0;
        
        // No porn reward
        if (!habits.noPorn) {
            xpGained += 50;
            // Extend no-porn streak
            this.state.noPornStreak = wasYesterday ? this.state.noPornStreak + 1 : 1;
        } else {
            this.state.noPornStreak = 0;
        }
        
        // Low screen time reward
        const screenTimeLimit = this.state.settings.screenTimeLimit;
        if (habits.screenTime <= screenTimeLimit) {
            xpGained += 30;
            this.state.lowScreenStreak = wasYesterday ? this.state.lowScreenStreak + 1 : 1;
        } else {
            this.state.lowScreenStreak = 0;
        }
        
        // Productivity task reward
        if (habits.productivityTask.trim() !== '') {
            xpGained += 40;
            this.state.productivityStreak = wasYesterday ? this.state.productivityStreak + 1 : 1;
        } else {
            this.state.productivityStreak = 0;
        }
        
        // Bonus for completing all three
        if (!habits.noPorn && habits.screenTime <= screenTimeLimit && habits.productivityTask.trim() !== '') {
            xpGained += 50; // Bonus XP
        }
        
        // Apply rewards/penalties
        this.state.totalXP += xpGained;
        
        // Update streak if all habits were good
        if (!habits.noPorn && habits.screenTime <= screenTimeLimit && habits.productivityTask.trim() !== '') {
            this.state.streak = wasYesterday ? this.state.streak + 1 : 1;
        } else {
            this.state.streak = 0;
        }
        
        // Update world state based on habits
        this.updateWorldState();
        
        // Update character level based on XP
        this.updateCharacterLevel();
        
        // Check for achievements
        this.checkAchievements();
        
        // Save state
        this.saveState();
        
        // Update UI
        this.updateUI();
        
        return xpGained;
    }

    updateWorldState() {
        // Calculate world brightness based on streaks
        const avgStreak = (this.state.noPornStreak + this.state.lowScreenStreak + this.state.productivityStreak) / 3;
        
        if (avgStreak > 14) {
            this.state.worldState = 'bright';
        } else if (avgStreak > 7) {
            this.state.worldState = 'normal';
        } else if (avgStreak > 3) {
            this.state.worldState = 'dim';
        } else {
            this.state.worldState = 'dark';
        }
    }

    updateCharacterLevel() {
        // Level increases every 500 XP
        this.state.characterLevel = Math.floor(this.state.totalXP / 500) + 1;
    }

    checkAchievements() {
        // Check for achievements
        if (this.state.noPornStreak >= 7 && !this.state.achievements.includes('week-no-porn')) {
            this.state.achievements.push('week-no-porn');
            this.showAchievement('Week of Purity!', '7 days without porn');
        }
        
        if (this.state.streak >= 7 && !this.state.achievements.includes('week-discipline')) {
            this.state.achievements.push('week-discipline');
            this.showAchievement('Disciplined Week!', '7 days of perfect habits');
        }
        
        if (this.state.totalXP >= 1000 && !this.state.achievements.includes('thousand-xp')) {
            this.state.achievements.push('thousand-xp');
            this.showAchievement('Thousand XP!', 'Reached 1000 total XP');
        }
    }

    showAchievement(title, description) {
        // Create achievement notification
        const achievement = document.createElement('div');
        achievement.className = 'achievement-notification';
        achievement.innerHTML = `
            <h4>🏆 Achievement Unlocked!</h4>
            <h5>${title}</h5>
            <p>${description}</p>
        `;
        
        document.body.appendChild(achievement);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            achievement.remove();
        }, 5000);
    }

    getMotivationalMessage() {
        const messages = [
            "Every choice builds character. Choose wisely.",
            "The hero within you grows stronger with each challenge.",
            "Small victories today create great triumphs tomorrow.",
            "Your willpower is a muscle that strengthens with use.",
            "Each day without relapse is a victory worth celebrating.",
            "You have the power to change your habits and your life.",
            "Discipline is choosing between what you want now and what you want most.",
            "Your future self will thank you for the choices you make today.",
            "The journey of a thousand miles begins with a single step.",
            "You are stronger than your urges.",
            "Progress, not perfection, is the goal.",
            "Recovery is not a destination but a journey of daily choices."
        ];
        
        return messages[Math.floor(Math.random() * messages.length)];
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const pageId = link.getAttribute('data-page');
                this.showPage(pageId);
                
                // Update active nav link
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
        
        // Habit log form
        const logForm = document.getElementById('habit-log-form');
        if (logForm) {
            logForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const noPorn = document.getElementById('no-porn-no').checked;
                const screenTime = parseInt(document.getElementById('screen-time').value);
                const productivityTask = document.getElementById('productive-task').value;
                
                const habits = {
                    noPorn: !noPorn, // true if they said "no" to porn
                    screenTime: screenTime,
                    productivityTask: productivityTask
                };
                
                const xpGained = this.logHabits(habits);
                
                // Show feedback
                this.showLogFeedback(xpGained);
            });
        }
        
        // Screen time slider
        const screenTimeSlider = document.getElementById('screen-time');
        const screenTimeValue = document.getElementById('screen-time-value');
        if (screenTimeSlider && screenTimeValue) {
            screenTimeSlider.addEventListener('input', (e) => {
                screenTimeValue.textContent = `${e.target.value} minutes`;
            });
        }
        
        // Settings
        const screenTimeLimitEl = document.getElementById('screen-time-limit');
        if (screenTimeLimitEl) {
            screenTimeLimitEl.addEventListener('change', (e) => {
                this.state.settings.screenTimeLimit = parseInt(e.target.value);
                this.saveState();
            });
        }
        
        const resetDataBtn = document.getElementById('reset-data');
        if (resetDataBtn) {
            resetDataBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all your data? This cannot be undone.')) {
                    this.resetData();
                }
            });
        }
    }

    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        document.getElementById(`${pageId}-page`).classList.add('active');
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
            padding: 20px;
            border-radius: 10px;
            border: 1px solid #4cc9f0;
            z-index: 10000;
            text-align: center;
            backdrop-filter: blur(10px);
        `;
        
        feedback.innerHTML = `
            <h3 style="color: #4cc9f0; margin-bottom: 10px;">Log Saved!</h3>
            <p style="margin: 10px 0;">You earned <strong>${xpGained} XP</strong> today!</p>
            <p style="margin: 10px 0;">Keep up the great work!</p>
            <button id="close-feedback" style="
                background: #4cc9f0; 
                color: #0a0a1a; 
                border: none; 
                padding: 10px 20px; 
                border-radius: 5px; 
                cursor: pointer; 
                margin-top: 15px;
            ">Continue Journey</button>
        `;
        
        document.body.appendChild(feedback);
        
        document.getElementById('close-feedback').addEventListener('click', () => {
            feedback.remove();
        });
    }

    updateUI() {
        // Update dashboard stats
        document.getElementById('streak-count').textContent = this.state.streak;
        document.getElementById('total-xp').textContent = this.state.totalXP;
        document.getElementById('productivity-score').textContent = this.calculateProductivityScore() + '%';
        
        // Update XP bar
        const xpToNextLevel = (this.state.characterLevel * 500) - this.state.totalXP;
        const xpPercent = Math.min(100, Math.max(0, (this.state.totalXP % 500) / 5));
        document.getElementById('xp-fill').style.width = `${xpPercent}%`;
        document.getElementById('xp-text').textContent = `${this.state.totalXP % 500} / 500 XP to next level`;
        
        // Update streak displays
        document.getElementById('no-porn-streak').textContent = this.state.noPornStreak;
        document.getElementById('low-screen-streak').textContent = this.state.lowScreenStreak;
        document.getElementById('productivity-streak').textContent = this.state.productivityStreak;
        
        // Update character based on level
        this.updateCharacterDisplay();
        
        // Update world display based on state
        this.updateWorldDisplay();
        
        // Update motivation message
        document.getElementById('motivation-message').textContent = this.getMotivationalMessage();
    }

    calculateProductivityScore() {
        // Calculate based on productivity streak and total days logged
        if (!this.state.lastLogDate) return 0;
        
        // For now, return a simple calculation - in a real app, you'd track more data
        return Math.min(100, this.state.productivityStreak * 10);
    }

    updateCharacterDisplay() {
        const characterEl = document.getElementById('character');
        const statusEl = document.getElementById('character-status');
        
        // Visual representation based on level and streaks
        const level = this.state.characterLevel;
        const avgStreak = (this.state.noPornStreak + this.state.lowScreenStreak + this.state.productivityStreak) / 3;
        
        // Clear previous content
        characterEl.innerHTML = '';
        
        // Add character elements based on level and streaks
        if (avgStreak > 14) {
            characterEl.innerHTML = '🦸‍♂️';
            statusEl.textContent = 'Your hero is at peak strength!';
        } else if (avgStreak > 7) {
            characterEl.innerHTML = '👤💪';
            statusEl.textContent = 'Your character grows stronger with discipline!';
        } else if (avgStreak > 3) {
            characterEl.innerHTML = '👤';
            statusEl.textContent = 'Your character is developing through effort!';
        } else {
            characterEl.innerHTML = '👤';
            statusEl.textContent = 'Your character is on a journey of growth!';
        }
    }

    updateWorldDisplay() {
        const terrainEl = document.getElementById('terrain');
        const weatherEl = document.getElementById('weather');
        const worldStatusEl = document.getElementById('world-status');
        const terrainImageEl = document.getElementById('terrain-image');
        
        // Update based on world state
        switch(this.state.worldState) {
            case 'bright':
                terrainEl.innerHTML = '<div style="color: #4cc9f0;">☀️ Lush Greenery</div>';
                weatherEl.innerHTML = '<div style="color: #a9d6e5;">Weather: Sunny & Clear</div>';
                worldStatusEl.textContent = 'The world is bright and full of life!';
                terrainImageEl.style.background = 'linear-gradient(135deg, #2a9d8f, #8ac926)';
                break;
            case 'normal':
                terrainEl.innerHTML = '<div style="color: #e9c46a;">🌿 Decent Landscape</div>';
                weatherEl.innerHTML = '<div style="color: #8d99ae;">Weather: Partly Cloudy</div>';
                worldStatusEl.textContent = 'The world has a balanced atmosphere.';
                terrainImageEl.style.background = 'linear-gradient(135deg, #e9c46a, #f4a261)';
                break;
            case 'dim':
                terrainEl.innerHTML = '<div style="color: #f4a261;">枯Dry Terrain</div>';
                weatherEl.innerHTML = '<div style="color: #adb5bd;">Weather: Overcast</div>';
                worldStatusEl.textContent = 'The world appears more challenging now.';
                terrainImageEl.style.background = 'linear-gradient(135deg, #f4a261, #e76f51)';
                break;
            case 'dark':
                terrainEl.innerHTML = '<div style="color: #e76f51;">枯Barren Land</div>';
                weatherEl.innerHTML = '<div style="color: #6c757d;">Weather: Stormy</div>';
                worldStatusEl.textContent = 'The world is dark, but there is still hope.';
                terrainImageEl.style.background = 'linear-gradient(135deg, #e76f51, #264653)';
                break;
        }
    }

    resetData() {
        if (confirm('Are you sure you want to reset all your data? This cannot be undone.')) {
            this.state = {
                totalXP: 0,
                streak: 0,
                noPornStreak: 0,
                lowScreenStreak: 0,
                productivityStreak: 0,
                lastLogDate: null,
                habits: {
                    noPorn: true,
                    screenTime: 0,
                    productivityTask: ''
                },
                settings: {
                    screenTimeLimit: 120,
                    theme: 'dark',
                    motivationFrequency: 'medium'
                },
                achievements: [],
                worldState: 'bright',
                characterLevel: 1,
                currentLocation: 'village'
            };
            
            this.saveState();
            this.updateUI();
            
            alert('All data has been reset. Your journey starts anew!');
        }
    }
}

// Initialize the game when the page loads
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new Game();
});