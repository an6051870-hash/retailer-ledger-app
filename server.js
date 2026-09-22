const express = require('express');
const session = require('express-session');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'ahmad-karyana-secret-key',
    resave: false,
    saveUninitialized: true
}));

// عارضی ڈیٹا بیس (اکاؤنٹس اور ٹرانزیکشنز کے لیے)
let accountsData = {
    'JazzCash': { opening: 10000, cashIn: 0, cashOut: 0, profit: 0 },
    'EasyPaisa': { opening: 5000, cashIn: 0, cashOut: 0, profit: 0 },
    'Bank Alfalah': { opening: 50000, cashIn: 0, cashOut: 0, profit: 0 },
    'JazzCash Business': { opening: 25000, cashIn: 0, cashOut: 0, profit: 0 }
};

let transactionLogs = [];

// 1. لاگ ان پیج
app.get('/login', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Ahmad Karyan Store - Login</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #1b5e20, #2e7d32); height: 100vh; display: flex; justify-content: center; align-items: center; margin: 0; }
                .login-box { background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.3); width: 350px; text-align: center; }
                h2 { color: #1b5e20; margin-bottom: 20px; }
                input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; }
                button { background: #2e7d32; color: white; border: none; padding: 12px; width: 100%; border-radius: 6px; font-size: 16px; cursor: pointer; font-weight: bold; }
                button:hover { background: #1b5e20; }
                .error { color: red; font-size: 14px; margin-bottom: 10px; }
            </style>
        </head>
        <body>
            <div class="login-box">
                <h2>🛒 Ahmad Karyan Store</h2>
                <p style="color: #666; font-size: 14px;">لاگ ان کریں اور ڈیجیٹل حساب کتاب سنبھالیں</p>
                <form action="/login" method="POST">
                    <input type="text" name="username" placeholder="یوزر نیم (Username)" required>
                    <input type="password" name="password" placeholder="پاسورڈ (Password)" required>
                    <button type="submit">لاگ ان کریں</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // آپ اپنا یوزر نیم اور پاسورڈ یہاں سیٹ کر سکتے ہیں (مثلاً: admin / 12345)
    if (username === 'ahmad' && password === '12345') {
        req.session.isAuthenticated = true;
        res.redirect('/');
    } else {
        res.send(`<script>alert('غلط یوزر نیم یا پاسورڈ!'); window.location.href='/login';</script>`);
    }
});

// لاگ آؤٹ
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// 2. مین ڈیش بورڈ (ڈیلرز/بینکس کا حساب کتاب)
app.get('/', (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    }

    let totalOpening = 0;
    let totalCashIn = 0;
    let totalCashOut = 0;
    let totalClosing = 0;
    let totalProfit = 0;

    let tableRows = '';
    for (let acc in accountsData) {
        let d = accountsData[acc];
        // فارمولہ: Closing = Opening + Cash In - Cash Out
        let closing = d.opening + d.cashIn - d.cashOut;
        
        totalOpening += d.opening;
        totalCashIn += d.cashIn;
        totalCashOut += d.cashOut;
        totalClosing += closing;
        totalProfit += d.profit;

        tableRows += `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #ddd; font-weight: bold;">${acc}</td>
                <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">Rs. ${d.opening.toLocaleString()}</td>
                <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right; color: green;">+ Rs. ${d.cashIn.toLocaleString()}</td>
                <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right; color: red;">- Rs. ${d.cashOut.toLocaleString()}</td>
                <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold; color: #0d47a1;">Rs. ${closing.toLocaleString()}</td>
                <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right; color: #2e7d32; font-weight: bold;">Rs. ${d.profit.toLocaleString()}</td>
            </tr>
        `;
    }

    let logsHtml = '';
    transactionLogs.slice(-10).reverse().forEach(t => {
        logsHtml += `<tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${t.time}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${t.account}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${t.type}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">Rs. ${t.amount}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${t.customer}</td>
        </tr>`;
    });

    res.send(`
        <html>
        <head>
            <title>Ahmad Karyan Store - Dashboard</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f6f9; margin: 0; padding: 20px; }
                .container { max-width: 1100px; margin: auto; background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
                .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2e7d32; padding-bottom: 15px; margin-bottom: 20px; }
                .header h1 { color: #1b5e20; margin: 0; font-size: 26px; }
                .logout-btn { background: #d32f2f; color: white; padding: 8px 15px; text-decoration: none; border-radius: 5px; font-size: 14px; }
                .summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
                .card { background: #e8f5e9; padding: 15px; border-radius: 8px; border-left: 5px solid #2e7d32; text-align: center; }
                .card h3 { margin: 0 0 5px 0; color: #333; font-size: 14px; }
                .card p { margin: 0; font-size: 18px; font-weight: bold; color: #1b5e20; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
                th { background: #2e7d32; color: white; padding: 12px; text-align: left; }
                .form-section { background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #ddd; }
                .form-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 15px; }
                input, select { padding: 10px; border: 1px solid #ccc; border-radius: 5px; width: 100%; box-sizing: border-box; }
                button { background: #2e7d32; color: white; border: none; padding: 12px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 15px; }
                button:hover { background: #1b5e20; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🌾 Ahmad Karyan Store <span style="font-size: 16px; color: #666;">(Digital Ledger & Banking Hub)</span></h1>
                    <a href="/logout" class="logout-btn">لاگ آؤٹ (Logout)</a>
                </div>

                <!-- Summary Cards -->
                <div class="summary-cards">
                    <div class="card">
                        <h3>کل اوپننگ بیلنس</h3>
                        <p>Rs. ${totalOpening.toLocaleString()}</p>
                    </div>
                    <div class="card">
                        <h3>کل کیش ان (Deposit)</h3>
                        <p style="color: green;">Rs. ${totalCashIn.toLocaleString()}</p>
                    </div>
                    <div class="card">
                        <h3>کل کیش آؤٹ (Withdraw)</h3>
                        <p style="color: red;">Rs. ${totalCashOut.toLocaleString()}</p>
                    </div>
                    <div class="card" style="border-left-color: #0d47a1; background: #e3f2fd;">
                        <h3>کل متوقع پرافٹ</h3>
                        <p style="color: #0d47a1;">Rs. ${totalProfit.toLocaleString()}</p>
                    </div>
                </div>

                <!-- Main Accounts Table -->
                <h2>📊 بینک اور جاز کیش اکاؤنٹس کا خلاصہ</h2>
                <table>
                    <thead>
                        <tr>
                            <th>اکاؤنٹ کا نام</th>
                            <th style="text-align: right;">Opening Balance</th>
                            <th style="text-align: right;">Cash In</th>
                            <th style="text-align: right;">Cash Out</th>
                            <th style="text-align: right;">Closing Balance</th>
                            <th style="text-align: right;">Profit / Commission</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>

                <!-- Entry Form -->
                <div class="form-section">
                    <h3 style="margin-top: 0; color: #2e7d32;">➕ نئی ٹرانزیکشن شامل کریں</h3>
                    <form action="/add-transaction" method="POST">
                        <div class="form-row">
                            <select name="account" required>
                                <option value="">اکاؤنٹ منتخب کریں</option>
                                <option value="JazzCash">JazzCash</option>
                                <option value="EasyPaisa">EasyPaisa</option>
                                <option value="Bank Alfalah">Bank Alfalah</option>
                                <option value="JazzCash Business">JazzCash Business</option>
                            </select>
                            <select name="type" required>
                                <option value="Cash In">Cash In (رقم آئی)</option>
                                <option value="Cash Out">Cash Out (رقم دی)</option>
                            </select>
                            <input type="number" name="amount" placeholder="رقم (Amount)" required>
                            <input type="number" name="profit" placeholder="پرافٹ / کمیشن (Profit)" required>
                            <input type="text" name="customer" placeholder="کسٹمر نام / نمبر" required>
                        </div>
                        <button type="submit">انٹری محفوظ کریں</button>
                    </form>
                </div>

                <!-- Recent Transactions Log -->
                <h3 style="margin-top: 30px;">🕒 حالیہ ٹرانزیکشنز کا ریکارڈ</h3>
                <table style="font-size: 14px;">
                    <thead>
                        <tr style="background: #37474f;">
                            <th>وقت</th>
                            <th>اکاؤنٹ</th>
                            <th>قسم</th>
                            <th>رقم</th>
                            <th>کسٹمر</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${logsHtml || '<tr><td colspan="5" style="text-align:center; padding:10px;">کوئی انٹری موجود نہیں۔</td></tr>'}
                    </tbody>
                </table>
            </div>
        </body>
        </html>
    `);
});

// ٹرانزیکشن سیو کرنے کا روٹ اور فارمولے
app.post('/add-transaction', (req, res) => {
    if (!req.session.isAuthenticated) return res.redirect('/login');

    const { account, type, amount, profit, customer } = req.body;
    let amt = parseFloat(amount) || 0;
    let prf = parseFloat(profit) || 0;

    if (accountsData[account]) {
        if (type === 'Cash In') {
            accountsData[account].cashIn += amt;
        } else {
            accountsData[account].cashOut += amt;
        }
        accountsData[account].profit += prf;
    }

    transactionLogs.push({
        time: new Date().toLocaleTimeString(),
        account,
        type,
        amount: amt.toLocaleString(),
        customer
    });

    res.redirect('/');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log('Ahmad Karyan Store Pro App running on port ' + PORT);
});
