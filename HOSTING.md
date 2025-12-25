# Hosting Instructions for Victory Road

## Local Development Server

To run the game locally with a proper web server (recommended for development):

1. Make sure you have Node.js installed on your system
2. Navigate to your project directory in the terminal
3. Install dependencies:
   ```
   npm install
   ```
4. Start the server:
   ```
   npm start
   ```
5. Open your browser and go to `http://localhost:3000`

## Online Hosting Options

### 1. GitHub Pages (Free)
1. Create a GitHub repository with your game files
2. Enable GitHub Pages in repository settings
3. Your game will be available at `https://yourusername.github.io/repository-name`

### 2. Netlify (Free)
1. Create an account at netlify.com
2. Drag and drop your `addict-game` folder to deploy
3. Your game will be available at a generated URL

### 3. Vercel (Free)
1. Create an account at vercel.com
2. Install Vercel CLI: `npm i -g vercel`
3. Navigate to your project directory and run `vercel`
4. Follow the prompts to deploy

### 4. Heroku (Free tier available)
1. Create an account at heroku.com
2. Install Heroku CLI
3. Deploy using Git following Heroku's standard deployment process

### 5. Firebase Hosting (Free tier)
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Deploy: `firebase deploy`

## Static Hosting (Any Web Server)

Since this is a frontend-only application, you can host it on any static web server:

1. Simply upload all files in the `addict-game` directory to your web server
2. Make sure the directory structure is preserved
3. Ensure your server serves `index.html` for the root path

## Important Notes

- The game uses LocalStorage for data persistence, which works in all browsers
- No backend server is required for the core functionality
- All processing happens in the user's browser
- The game works offline once loaded (except for initial load and font resources)

## File Structure for Hosting
```
your-domain.com/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── game.js
│   └── ui.js
└── server.js (only needed for Node.js hosting)
```