const express = require('express');
const app = express();

app.use(express.json());

// Home page route taaki error na aaye
app.get('/', (req, res) => {
    res.send('Retailer Ledger App is Live!');
});

// Dummy API route for daily entry
app.post('/api/daily-entry', (req, res) => {
    res.json({ success: true, message: 'Entry saved successfully!' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log('Retailer App running on port ' + PORT);
});
