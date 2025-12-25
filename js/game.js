// Enhanced game state management
class Game {
    constructor() {
        this.state = this.loadState();
        this.init();
    }

    init() {
        this.updateUI();
        this.setupEventListeners();
        this.scheduleDailyReminder();
        this.checkStreakBonus();
    }

    loadState() {
        const saved = localStorage.getItem('addictGameSave');
        if (saved) {
            const state = JSON.parse(saved);
            // Add new features that might not be in old saves
            if (!state.settings.notifications) {
                state.settings.notifications = {
                    enabled: true,
                    time: '20:00',
                    frequency: 'daily'
                };
            }
            if (!state.achievements) {
                state.achievements = [];
            }
            if (!state.challenges) {
                state.challenges = [];
            }
            if (!state.habitHistory) {
                state.habitHistory = [];
            }
            if (!state.dailyRewards) {
                state.dailyRewards = {
                    claimedToday: false,
                    consecutiveDays: 0
                };
            }
            return state;
        } else {
            // Default state with new features
            return {
                totalXP: 0,
                streak: 0,
                noPornStreak: 0,
                lowScreenStreak: 0,
                productivityStreak: 0,
                lastLogDate: null,
                lastLoginDate: null,
                habits: {
                    noPorn: true,
                    screenTime: 0,
                    productivityTask: ''
                },
                settings: {
                    screenTimeLimit: 120,
                    theme: 'dark',
                    motivationFrequency: 'medium',
                    notifications: {
                        enabled: true,
                        time: '20:00',
                        frequency: 'daily'
                    }
                },
                achievements: [],
                challenges: [],
                worldState: 'bright', // bright, dim, dark
                characterLevel: 1,
                currentLocation: 'village',
                unlockedLocations: ['village'],
                dailyRewards: {
                    claimedToday: false,
                    consecutiveDays: 0
                },
                habitHistory: [] // Track habits over time
            };
        }
    }

    saveState() {
        localStorage.setItem('addictGameSave', JSON.stringify(this.state));
    }

    logHabits(habits) {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const wasYesterday = this.state.lastLogDate === yesterday;
        
        // Update habits
        this.state.habits = habits;
        this.state.lastLogDate = today;
        
        // Track habit history
        this.state.habitHistory.push({
            date: today,
            ...habits,
            xpGained: 0 // Will be calculated below
        });
        
        // Keep only last 30 days of history
        if (this.state.habitHistory.length > 30) {
            this.state.habitHistory.shift();
        }

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
        
        // Streak bonus
        if (this.state.streak > 0 && this.state.streak % 7 === 0) {
            xpGained += 100; // Weekly streak bonus
        }
        
        // Apply rewards/penalties
        this.state.totalXP += xpGained;
        
        // Update streak if all habits were good
        if (!habits.noPorn && habits.screenTime <= screenTimeLimit && habits.productivityTask.trim() !== '') {
            this.state.streak = wasYesterday ? this.state.streak + 1 : 1;
        } else {
            this.state.streak = 0;
        }
        
        // Update daily rewards
        this.updateDailyRewards();
        
        // Update world state based on habits
        this.updateWorldState();
        
        // Update character level based on XP
        this.updateCharacterLevel();
        
        // Check for achievements
        this.checkAchievements();
        
        // Check for challenges
        this.checkChallenges();
        
        // Update history with XP gained
        if (this.state.habitHistory.length > 0) {
            this.state.habitHistory[this.state.habitHistory.length - 1].xpGained = xpGained;
        }
        
        // Save state
        this.saveState();
        
        // Update UI
        this.updateUI();
        
        return xpGained;
    }

    updateDailyRewards() {
        const today = new Date().toDateString();
        const wasYesterday = this.state.lastLogDate === new Date(Date.now() - 86400000).toDateString();
        
        if (wasYesterday || this.state.lastLogDate === today) {
            // If logged yesterday or today, maintain/extend streak
            this.state.dailyRewards.consecutiveDays = wasYesterday ? 
                this.state.dailyRewards.consecutiveDays + 1 : 
                Math.max(1, this.state.dailyRewards.consecutiveDays);
        } else {
            // If missed a day, reset streak
            this.state.dailyRewards.consecutiveDays = 1;
        }
        
        this.state.dailyRewards.claimedToday = this.state.lastLogDate === today;
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
        
        // Unlock new locations based on progress
        this.unlockNewLocations();
    }

    unlockNewLocations() {
        // Unlock locations based on achievements
        if (this.state.noPornStreak >= 7 && !this.state.unlockedLocations.includes('forest')) {
            this.state.unlockedLocations.push('forest');
            this.showNotification('New Location Unlocked!', 'You unlocked the Forest of Focus!', 'success');
        }
        
        if (this.state.streak >= 14 && !this.state.unlockedLocations.includes('mountain')) {
            this.state.unlockedLocations.push('mountain');
            this.showNotification('New Location Unlocked!', 'You unlocked the Mountain of Discipline!', 'success');
        }
        
        if (this.state.totalXP >= 1000 && !this.state.unlockedLocations.includes('ocean')) {
            this.state.unlockedLocations.push('ocean');
            this.showNotification('New Location Unlocked!', 'You unlocked the Ocean of Calm!', 'success');
        }
    }

    updateCharacterLevel() {
        // Level increases every 500 XP
        const newLevel = Math.floor(this.state.totalXP / 500) + 1;
        
        // Level up notification
        if (newLevel > this.state.characterLevel) {
            this.state.characterLevel = newLevel;
            this.showNotification('Level Up!', `You reached level ${newLevel}!`, 'success');
        }
    }

    checkAchievements() {
        const today = new Date().toDateString();
        
        // 7-day no porn streak
        if (this.state.noPornStreak >= 7 && !this.hasAchievement('week-no-porn')) {
            this.addAchievement('week-no-porn', 'Week of Purity', '7 days without porn');
        }
        
        // 7-day perfect habits
        if (this.state.streak >= 7 && !this.hasAchievement('week-discipline')) {
            this.addAchievement('week-discipline', 'Disciplined Week', '7 days of perfect habits');
        }
        
        // 1000 XP milestone
        if (this.state.totalXP >= 1000 && !this.hasAchievement('thousand-xp')) {
            this.addAchievement('thousand-xp', 'Thousand XP', 'Reached 1000 total XP');
        }
        
        // Daily log consistency
        if (this.state.dailyRewards.consecutiveDays >= 7 && !this.hasAchievement('daily-streak')) {
            this.addAchievement('daily-streak', 'Daily Commitment', 'Logged habits for 7 consecutive days');
        }
        
        // Productivity master
        if (this.state.productivityStreak >= 14 && !this.hasAchievement('productivity-master')) {
            this.addAchievement('productivity-master', 'Productivity Master', '14 days of productive tasks');
        }
    }

    hasAchievement(id) {
        return this.state.achievements.some(ach => ach.id === id);
    }

    addAchievement(id, title, description) {
        const newAchievement = { id, title, description, date: new Date().toDateString() };
        this.state.achievements.push(newAchievement);
        this.showAchievement(newAchievement);
    }

    checkChallenges() {
        // Daily challenges
        const today = new Date().toDateString();
        const hasTodaysChallenge = this.state.challenges.some(ch => ch.date === today);
        
        if (!hasTodaysChallenge) {
            // Generate a new daily challenge
            const challenges = [
                { id: 'less-screen', title: 'Screen Time Challenge', description: 'Keep screen time under 60 minutes', xpReward: 25 },
                { id: 'productive-task', title: 'Deep Work Challenge', description: 'Complete a meaningful productive task', xpReward: 35 },
                { id: 'mindful-moment', title: 'Mindfulness Challenge', description: 'Take 5 minutes for mindfulness', xpReward: 20 },
                { id: 'help-someone', title: 'Service Challenge', description: 'Do something kind for someone else', xpReward: 30 }
            ];
            
            const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
            randomChallenge.date = today;
            randomChallenge.completed = false;
            this.state.challenges.push(randomChallenge);
            
            this.showNotification('New Challenge!', randomChallenge.description, 'info');
        }
    }

    completeChallenge(challengeId) {
        const challenge = this.state.challenges.find(ch => ch.id === challengeId);
        if (challenge && !challenge.completed) {
            challenge.completed = true;
            this.state.totalXP += challenge.xpReward;
            this.showNotification('Challenge Complete!', `+${challenge.xpReward} XP`, 'success');
            this.saveState();
            this.updateUI();
        }
    }

    showAchievement(achievement) {
        // Create achievement notification
        const achievementEl = this.createNotification(achievement.title, `Achievement Unlocked: ${achievement.description}`, 'achievement');
        document.body.appendChild(achievementEl);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            achievementEl.remove();
        }, 5000);
    }

    showNotification(title, message, type = 'info') {
        const notification = this.createNotification(title, message, type);
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    createNotification(title, message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'rgba(40, 167, 69, 0.9)' : 
                        type === 'achievement' ? 'rgba(106, 27, 154, 0.9)' : 
                        type === 'warning' ? 'rgba(255, 152, 0, 0.9)' : 'rgba(33, 150, 243, 0.9)'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 350px;
            min-width: 250px;
            font-family: inherit;
        `;
        
        notification.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">${title}</div>
            <div style="font-size: 0.9em;">${message}</div>
        `;
        
        return notification;
    }

    checkStreakBonus() {
        // Check if the user logged in today
        const today = new Date().toDateString();
        if (this.state.lastLoginDate !== today) {
            this.state.lastLoginDate = today;
            
            // If they logged in yesterday, they maintained the login streak
            if (this.state.lastLoginDate === new Date(Date.now() - 86400000).toDateString()) {
                this.state.loginStreak = (this.state.loginStreak || 0) + 1;
            } else {
                this.state.loginStreak = 1;
            }
            
            this.saveState();
        }
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
            "Recovery is not a destination but a journey of daily choices.",
            "Your strength today creates your freedom tomorrow.",
            "Each day of discipline is a gift to your future self.",
            "You've overcome challenges before, and you can do it again.",
            "Every moment is a new opportunity to make a positive choice."
        ];
        
        // Add special messages for milestones
        if (this.state.streak >= 30) {
            messages.push("A month of discipline! You're developing incredible strength.");
        } else if (this.state.streak >= 7) {
            messages.push("A week of consistency! Your discipline is taking root.");
        }
        
        return messages[Math.floor(Math.random() * messages.length)];
    }

    scheduleDailyReminder() {
        // Schedule notification based on user settings
        const settings = this.state.settings.notifications;
        if (settings.enabled && settings.time) {
            const [hours, minutes] = settings.time.split(':').map(Number);
            const now = new Date();
            const reminderTime = new Date();
            reminderTime.setHours(hours, minutes, 0, 0);
            
            // If it's already past reminder time today, schedule for tomorrow
            if (reminderTime <= now) {
                reminderTime.setDate(reminderTime.getDate() + 1);
            }
            
            const timeToReminder = reminderTime - now;
            
            setTimeout(() => {
                this.showNotification(
                    'Daily Check-in', 
                    'Time to log your habits and continue your journey!', 
                    'info'
                );
                
                // Schedule the next day's reminder
                this.scheduleDailyReminder();
            }, timeToReminder);
        }
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
                const screenTimeValue = document.getElementById('screen-time').value;
                const screenTime = screenTimeValue ? parseInt(screenTimeValue) : 0;
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
        
        // Notification settings
        const notificationEnabled = document.getElementById('notification-enabled');
        if (notificationEnabled) {
            notificationEnabled.checked = this.state.settings.notifications.enabled;
            notificationEnabled.addEventListener('change', (e) => {
                this.state.settings.notifications.enabled = e.target.checked;
                this.saveState();
            });
        }
        
        const notificationTime = document.getElementById('daily-reminder');
        if (notificationTime) {
            notificationTime.value = this.state.settings.notifications.time;
            notificationTime.addEventListener('change', (e) => {
                this.state.settings.notifications.time = e.target.value;
                this.saveState();
            });
        }
        
        // Complete challenge buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('complete-challenge-btn')) {
                const challengeId = e.target.getAttribute('data-challenge-id');
                this.completeChallenge(challengeId);
            }
        });
    }

    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        document.getElementById(`${pageId}-page`).classList.add('active');
        
        // Special handling for different pages
        if (pageId === 'challenges') {
            this.renderChallenges();
        } else if (pageId === 'history') {
            this.renderHistory();
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

    updateUI() {
        // Update dashboard stats
        document.getElementById('streak-count').textContent = this.state.streak;
        document.getElementById('total-xp').textContent = this.state.totalXP;
        document.getElementById('productivity-score').textContent = this.calculateProductivityScore() + '%';
        document.getElementById('login-streak').textContent = this.state.loginStreak || 0;
        document.getElementById('daily-rewards-count').textContent = this.state.dailyRewards.consecutiveDays;
        
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
        
        // Update challenge display if on challenges page
        if (document.getElementById('challenges-page').classList.contains('active')) {
            this.renderChallenges();
        }
    }

    calculateProductivityScore() {
        // Calculate based on productivity streak and total days logged
        if (this.state.habitHistory.length === 0) return 0;
        
        const completedTasks = this.state.habitHistory.filter(h => h.productivityTask.trim() !== '').length;
        return Math.round((completedTasks / this.state.habitHistory.length) * 100);
    }

    updateCharacterDisplay() {
        const characterEl = document.getElementById('character');
        const statusEl = document.getElementById('character-status');
        
        if (!characterEl || !statusEl) return;
        
        // Calculate character appearance based on stats
        const avgStreak = (this.state.noPornStreak + this.state.lowScreenStreak + this.state.productivityStreak) / 3;
        const level = this.state.characterLevel;
        const totalXP = this.state.totalXP;
        
        // Reset character styling
        characterEl.style.background = '';
        
        if (avgStreak > 14) {
            // Hero level
            characterEl.innerHTML = '🦸‍♂️';
            characterEl.style.background = 'linear-gradient(135deg, #4cc9f0, #4361ee)';
            characterEl.style.fontSize = '4rem';
            characterEl.style.border = '3px solid #4cc9f0';
            statusEl.textContent = 'Your hero is at peak strength! Keep it up!';
        } else if (avgStreak > 7) {
            // Strong character
            characterEl.innerHTML = '👤💪';
            characterEl.style.background = 'linear-gradient(135deg, #4cc9f0, #3a86ff)';
            characterEl.style.fontSize = '3rem';
            characterEl.style.border = '2px solid #3a86ff';
            statusEl.textContent = 'Your character grows stronger with discipline!';
        } else if (avgStreak > 3) {
            // Developing character
            characterEl.innerHTML = '👤';
            characterEl.style.background = 'linear-gradient(135deg, #3a86ff, #333)';
            characterEl.style.fontSize = '2.5rem';
            characterEl.style.border = '1px solid #3a86ff';
            statusEl.textContent = 'Your character is developing through effort!';
        } else {
            // Basic character
            characterEl.innerHTML = '👤';
            characterEl.style.background = 'linear-gradient(135deg, #6a6a6a, #333)';
            characterEl.style.fontSize = '2rem';
            characterEl.style.border = '1px solid #666';
            statusEl.textContent = 'Your character is on a journey of growth!';
        }
        
        // Add XP level indicator if level > 1
        if (level > 1) {
            characterEl.style.position = 'relative';
            const levelBadge = document.createElement('div');
            levelBadge.textContent = `Lvl ${level}`;
            levelBadge.style.position = 'absolute';
            levelBadge.style.top = '-10px';
            levelBadge.style.right = '-10px';
            levelBadge.style.background = '#4cc9f0';
            levelBadge.style.color = '#0a0a1a';
            levelBadge.style.borderRadius = '50%';
            levelBadge.style.width = '30px';
            levelBadge.style.height = '30px';
            levelBadge.style.display = 'flex';
            levelBadge.style.alignItems = 'center';
            levelBadge.style.justifyContent = 'center';
            levelBadge.style.fontSize = '0.8rem';
            levelBadge.style.fontWeight = 'bold';
            characterEl.appendChild(levelBadge);
        }
    }

    updateWorldDisplay() {
        const terrainEl = document.getElementById('terrain');
        const weatherEl = document.getElementById('weather');
        const worldStatusEl = document.getElementById('world-status');
        const terrainImageEl = document.getElementById('terrain-image');
        
        if (!terrainEl || !weatherEl || !worldStatusEl || !terrainImageEl) return;
        
        // Update based on world state
        switch(this.state.worldState) {
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

    renderChallenges() {
        const challengesContainer = document.getElementById('challenges-list');
        if (!challengesContainer) return;
        
        const today = new Date().toDateString();
        const todayChallenge = this.state.challenges.find(c => c.date === today);
        
        if (todayChallenge) {
            let challengeHTML = `
                <div class="challenge-item ${todayChallenge.completed ? 'completed' : ''}">
                    <h4>${todayChallenge.title}</h4>
                    <p>${todayChallenge.description}</p>
                    <div class="challenge-reward">XP Reward: <span class="xp-highlight">${todayChallenge.xpReward}</span></div>
                    ${todayChallenge.completed ? 
                        '<div class="challenge-status completed">✓ Completed!</div>' : 
                        `<button class="btn-primary complete-challenge-btn" data-challenge-id="${todayChallenge.id}">Complete Challenge</button>`
                    }
                </div>
            `;
            
            // Add other challenges
            const otherChallenges = this.state.challenges.filter(c => c.date !== today);
            if (otherChallenges.length > 0) {
                challengeHTML += '<h3 style="margin-top: 20px; border-top: 1px solid #4cc9f0; padding-top: 20px;">Previous Challenges</h3>';
                
                otherChallenges.forEach(challenge => {
                    challengeHTML += `
                        <div class="challenge-item ${challenge.completed ? 'completed' : ''}">
                            <h4>${challenge.title}</h4>
                            <p>${challenge.description}</p>
                            <div class="challenge-reward">XP Reward: <span class="xp-highlight">${challenge.xpReward}</span></div>
                            <div class="challenge-status ${challenge.completed ? 'completed' : 'pending'}">
                                ${challenge.completed ? '✓ Completed' : 'Pending'}
                            </div>
                        </div>
                    `;
                });
            }
            
            challengesContainer.innerHTML = challengeHTML;
        } else {
            challengesContainer.innerHTML = '<p>No challenges available yet. Log your habits first!</p>';
        }
    }

    renderHistory() {
        const historyContainer = document.getElementById('history-list');
        if (!historyContainer) return;
        
        if (this.state.habitHistory.length === 0) {
            historyContainer.innerHTML = '<p>No history available yet. Start by logging your habits!</p>';
            return;
        }
        
        let historyHTML = '<div class="history-grid">';
        
        // Show last 7 days of history
        const recentHistory = this.state.habitHistory.slice(-7);
        recentHistory.forEach((entry, index) => {
            const date = new Date(entry.date);
            const dateStr = date.toLocaleDateString();
            const isToday = entry.date === new Date().toDateString();
            
            historyHTML += `
                <div class="history-item ${isToday ? 'today' : ''}">
                    <div class="history-date">${dateStr} ${isToday ? '(Today)' : ''}</div>
                    <div class="habit-summary">
                        <div class="habit-porn">Porno: ${entry.noPorn ? '❌' : '✓'}</div>
                        <div class="habit-screen">Screen: ${entry.screenTime}m</div>
                        <div class="habit-productivity">Productive: ${entry.productivityTask ? '✓' : '✗'}</div>
                    </div>
                    <div class="xp-gained">+${entry.xpGained} XP</div>
                </div>
            `;
        });
        
        historyHTML += '</div>';
        historyContainer.innerHTML = historyHTML;
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
                lastLoginDate: null,
                habits: {
                    noPorn: true,
                    screenTime: 0,
                    productivityTask: ''
                },
                settings: {
                    screenTimeLimit: 120,
                    theme: 'dark',
                    motivationFrequency: 'medium',
                    notifications: {
                        enabled: true,
                        time: '20:00',
                        frequency: 'daily'
                    }
                },
                achievements: [],
                challenges: [],
                worldState: 'bright',
                characterLevel: 1,
                currentLocation: 'village',
                unlockedLocations: ['village'],
                dailyRewards: {
                    claimedToday: false,
                    consecutiveDays: 0
                },
                habitHistory: []
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