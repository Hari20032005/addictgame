const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'addict-game' directory
app.use(express.static(path.join(__dirname, 'addict-game')));

// Route to serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'addict-game', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Victory Road game is running on http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server');
});