const express = require('express');
const app = express();

app.use(express.json());

// Shop Home Page with Ahmad Karyan Store Name
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: Arial; text-align: center; margin-top: 50px;">
            <h1 style="color: #e60000;">Ahmad Karyan Store</h1>
            <h3>JazzCash & Retail Ledger System</h3>
            <p>خوش آمدید! آپ کی دکان کا حساب کتاب سسٹم لائیو ہے۔</p>
        </div>
    `);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log('Ahmad Karyan Store App running on port ' + PORT);
});
