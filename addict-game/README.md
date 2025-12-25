# Victory Road - Addiction Recovery Game

A web-based game designed to help users overcome porn addiction and social media overuse through a reward-and-consequence system. Transform discipline into a rewarding game experience that replaces instant dopamine habits with earned progress.

## Game Concept

This is a narrative-driven progression game where real-life habits directly affect the in-game world. Players log daily behavior (porn usage, screen time, productivity), and the game responds with rewards or penalties.

### Core Features

1. **Daily Habit Log:**
   - Did you watch porn today? (Yes/No)
   - How many minutes did you spend on YouTube or short-form content?
   - What productive task did you complete today? (Text input)

2. **Reward System:**
   - No porn: +50 XP
   - Screen time ≤ 120 minutes: +30 XP
   - Productive task completed: +40 XP
   - Completing all three gives a bonus reward
   - Streaks unlock new levels, visuals, and story elements

3. **Punishment System (Non-shaming):**
   - Porn usage reduces XP and darkens the game world
   - Excessive screen time increases difficulty
   - No productivity spawns obstacles
   - No permanent failure or game over

4. **Visual Feedback:**
   - Character evolution
   - World map that improves or decays
   - XP bars, streak counters, animations

5. **Pages:**
   - Dashboard (stats, character, world state)
   - Daily Log Page
   - Progress & Analytics
   - Game World / Map
   - Settings

## Technology Stack

- Frontend only (HTML, CSS, JavaScript)
- LocalStorage for data persistence
- Clean UI, minimal distractions
- Mobile-friendly design

## How to Run

1. Download or clone this repository to your computer
2. Navigate to the `addict-game` folder
3. Open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge)
4. The game will start automatically and save your progress to your browser's LocalStorage

## Game Pages

### Dashboard
- Shows your current streaks, XP, and character status
- Displays the state of the game world
- Shows daily motivational messages

### Daily Log
- Log your behavior for the day
- See potential rewards before logging
- Submit your daily habits to earn XP

### Progress & Analytics
- Track your XP progression
- View streak statistics
- See historical data (placeholder)

### Game World / Map
- Explore locations that reflect your habits
- Read narrative that adapts to your progress
- Visit different areas to find inspiration

### Settings
- Adjust your daily screen time limit
- Change game theme (light/dark)
- Manage notification preferences
- Reset all data if needed

## Psychology Behind the Game

The game implements several psychological principles:

1. **Variable Rewards:** Motivational messages change daily to maintain engagement
2. **Progress Visualization:** XP bars and character evolution provide clear progress indicators
3. **Streak Building:** Encourages consistent daily habits
4. **Non-shaming Approach:** Punishments are implemented through world changes, not personal attacks
5. **Positive Reinforcement:** Rewards for good habits far outweigh penalties for bad ones

## Data Privacy

All data is stored locally in your browser using LocalStorage. No personal information is transmitted to any server. Your data remains completely private and secure on your device.

## Contributing

This is an open-source project designed to help those struggling with addiction. Contributions are welcome to improve the game mechanics, add new features, or enhance the therapeutic value.

## License

This project is completely free to use for personal or therapeutic purposes. Feel free to share it with anyone who might benefit from it.

---

Remember: Recovery is a journey, not a destination. Every day you choose discipline over gratification, you grow stronger. Your future self will thank you for the choices you make today.