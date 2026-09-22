const express = require('express');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const app = express();

app.use(express.json());

const COMMISSION_RATES = {
    jazzcash: 0.0015,   // 0.15% Commission
    easypaisa: 0.0015,  // 0.15% Commission
    jcBusiness: 0.0020, // 0.20% Commission
    bankAlfalah: 0.0010 // 0.10% Commission
};

let dailyLedger = [];

app.post('/api/daily-entry', (req, res) => {
    const { date, startingCash, jcVolume, epVolume, jcbVolume, bavolume, expenses } = req.body;

    const jcCommission = (jcVolume || 0) * COMMISSION_RATES.jazzcash;
    const epCommission = (epVolume || 0) * COMMISSION_RATES.easypaisa;
    const jcbCommission = (jcbVolume || 0) * COMMISSION_RATES.jcBusiness;
    const baCommission = (bavolume || 0) * COMMISSION_RATES.bankAlfalah;

    const totalCommission = jcCommission + epCommission + jcbCommission + baCommission;
    const netProfit = totalCommission - (expenses || 0);

    const entry = {
        date: date || new Date().toISOString().split('T')[0],
        startingCash: startingCash || 0,
        jcVolume: jcVolume || 0,
        epVolume: epVolume || 0,
        jcbVolume: jcbVolume || 0,
        bavolume: bavolume || 0,
        jcCommission,
        epCommission,
        jcbCommission,
        baCommission,
        totalCommission,
        expenses: expenses || 0,
        netProfit
    };

    dailyLedger.push(entry);
    res.json({ message: 'Entry saved successfully!', entry });
});

app.get('/api/ledger', (req, res) => {
    res.json(dailyLedger);
});

// Monthly report scheduler (Runs on the 1st of every month at midnight)
cron.schedule('0 0 1 * *', () => {
    sendMonthlyEmailStatement();
});

function sendMonthlyEmailStatement() {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    let mailOptions = {
        from: 'Retailer Ledger App',
        to: process.env.EMAIL_USER,
        subject: 'Monthly Retailer Profit & Loss Statement',
        text: `Aapki is mahine ki total ledger statement ready hai.\nTotal Entries: ${dailyLedger.length}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log(error);
        else console.log('Monthly Email Sent: ' + info.response);
    });
}

const PORT = process.env.PORT || 8080;
app.get('/', (req, res) => {
    res.send(`
        <h2>Retailer Ledger App is Live!</h2>
        <p>Aapka system kam kar raha hai. API endpoints:</p>
        <ul>
            <li>POST /api/daily-entry (Rozana entry ke liye)</li>
            <li>GET /api/ledger (Saara record dekhne ke liye)</li>
        </ul>
    `);
});
app.listen(PORT, () => console.log('Retailer App running on port ' + PORT));
