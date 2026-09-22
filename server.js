const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'ahmad-karyana-secure-key',
    resave: false,
    saveUninitialized: true
}));

const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, 'dp-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

let accountsData = {
    'JazzCash': { opening: 10000, cashIn: 0, cashOut: 0, profit: 0, logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/JazzCash_Logo.png' },
    'EasyPaisa': { opening: 5000, cashIn: 0, cashOut: 0, profit: 0, logo: 'https://play-lh.googleusercontent.com/10Wc490a1Vq0FzXpS7F2Q9Z6xV7xW9v3m1k9w2j8s5l6k3g2f1h0j9k8l7m6n5o4p' },
    'Bank Alfalah': { opening: 50000, cashIn: 0, cashOut: 0, profit: 0, logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Bank_Alfalah_Logo.svg' },
    'JazzCash Business': { opening: 25000, cashIn: 0, cashOut: 0, profit: 0, logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/JazzCash_Logo.png' }
};

let transactionLogs = [];
let userProfile = {
    name: 'Ahmad Naeem',
    phone: '0300-1234567',
    dp: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    email: 'an6051870@gmail.com'
};

let verificationCodes = {};

// Login Page
app.get('/login', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Ahmad Karyan Store - Professional Login</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: url('https://i.ibb.co/3s7925X/shop-bg.jpg') no-repeat center center fixed; background-size: cover; height: 100vh; display: flex; justify-content: center; align-items: center; margin: 0; backdrop-filter: blur(5px); background-color: rgba(0,0,0,0.6); }
                .login-box { background: rgba(255, 255, 255, 0.95); padding: 35px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); width: 380px; text-align: center; border-top: 5px solid #2e7d32; }
                .store-logo { width: 70px; height: 70px; border-radius: 50%; object-fit: cover; border: 3px solid #2e7d32; margin-bottom: 10px; }
                h2 { color: #1b5e20; margin: 5px 0 20px 0; font-size: 24px; }
                input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; font-size: 15px; text-align: center; }
                button { background: #2e7d32; color: white; border: none; padding: 12px; width: 100%; border-radius: 6px; font-size: 16px; cursor: pointer; font-weight: bold; transition: 0.3s; }
                button:hover { background: #1b5e20; }
            </style>
        </head>
        <body>
            <div class="login-box">
                <img src="https://cdn-icons-png.flaticon.com/512/3081/3081559.png" alt="Logo" class="store-logo">
                <h2>Ahmad Karyan Store</h2>
                <p style="color: #666; font-size: 13px; margin-bottom: 20px;">Enter your mobile number to receive verification code</p>
                <form action="/send-otp" method="POST">
                    <input type="text" name="phone" placeholder="Enter Mobile Number (e.g. 0300...)" required>
                    <button type="submit">Get Verification Code</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

app.post('/send-otp', (req, res) => {
    const { phone } = req.body;
    const otp = Math.floor(1000 + Math.random() * 9000);
    verificationCodes[phone] = otp;

    res.send(`
        <html>
        <head>
            <title>Verify OTP - Ahmad Karyan Store</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: rgba(0,0,0,0.7); height: 100vh; display: flex; justify-content: center; align-items: center; margin: 0; }
                .login-box { background: #fff; padding: 35px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); width: 380px; text-align: center; border-top: 5px solid #2e7d32; }
                h2 { color: #1b5e20; margin-bottom: 15px; }
                input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; font-size: 18px; text-align: center; letter-spacing: 3px; font-weight: bold; }
                button { background: #2e7d32; color: white; border: none; padding: 12px; width: 100%; border-radius: 6px; font-size: 16px; cursor: pointer; font-weight: bold; }
                button:hover { background: #1b5e20; }
                .otp-badge { background: #e8f5e9; color: #2e7d32; padding: 10px; border-radius: 6px; font-size: 15px; font-weight: bold; margin-bottom: 15px; border: 1px dashed #2e7d32; }
            </style>
        </head>
        <body>
            <div class="login-box">
                <h2>🔐 Security Verification</h2>
                <div class="otp-badge">
                    Your Login Code: <span style="font-size: 20px; color: #d32f2f;">${otp}</span>
                </div>
                <form action="/verify-otp" method="POST">
                    <input type="hidden" name="phone" value="${phone}">
                    <input type="text" name="enteredOtp" placeholder="Enter 4-Digit Code" maxlength="4" required>
                    <button type="submit">Verify & Login</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

app.post('/verify-otp', (req, res) => {
    const { phone, enteredOtp } = req.body;
    if (verificationCodes[phone] && verificationCodes[phone].toString() === enteredOtp.trim()) {
        req.session.isAuthenticated = true;
        delete verificationCodes[phone];
        res.redirect('/');
    } else {
        res.send(`<script>alert('Invalid Verification Code! Please try again.'); window.location.href='/login';</script>`);
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Profile Details Page
app.get('/profile', (req, res) => {
    if (!req.session.isAuthenticated) return res.redirect('/login');
    res.send(`
        <html>
        <head>
            <title>Ahmad Karyan Store - Profile Details</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f6f9; margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; height: 100vh; }
                .profile-card { background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); width: 420px; text-align: center; border-top: 5px solid #2e7d32; }
                .profile-card img { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #2e7d32; margin-bottom: 15px; }
                h2 { color: #1b5e20; margin: 5px 0; }
                p { color: #555; margin: 8px 0; font-size: 15px; }
                .info-box { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: left; border: 1px solid #ddd; }
                .info-box p { margin: 6px 0; }
                .btn { background: #2e7d32; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; text-decoration: none; display: inline-block; margin-top: 10px; }
                .btn:hover { background: #1b5e20; }
                .back-link { display: block; margin-top: 15px; color: #1b5e20; text-decoration: none; font-weight: bold; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="profile-card">
                <img src="${userProfile.dp}" alt="Owner DP">
                <h2>${userProfile.name}</h2>
                <p style="color: #666; font-size: 13px;">Store Owner & Administrator</p>
                
                <div class="info-box">
                    <p><strong>📧 Email:</strong> ${userProfile.email}</p>
                    <p><strong>📞 Mobile Number:</strong> ${userProfile.phone}</p>
                    <p><strong>🛒 Store Name:</strong> Ahmad Karyan Store</p>
                </div>

                <form action="/update-dp" method="POST" enctype="multipart/form-data" style="margin-top: 15px; background: #e8f5e9; padding: 12px; border-radius: 8px; border: 1px dashed #2e7d32;">
                    <p style="font-size: 13px; font-weight: bold; color: #2e7d32; margin-bottom: 8px;">Change Profile Picture:</p>
                    <input type="file" name="dpImage" accept="image/*" required style="font-size: 12px; margin-bottom: 8px;"><br>
                    <button type="submit" class="btn" style="padding: 8px 15px; font-size: 13px;">Upload New DP</button>
                </form>

                <a href="/" class="back-link">← Back to Dashboard</a>
            </div>
        </body>
        </html>
    `);
});

// Main Dashboard
app.get('/', (req, res) => {
    if (!req.session.isAuthenticated) return res.redirect('/login');

    let totalOpening = 0, totalCashIn = 0, totalCashOut = 0, totalClosing = 0, totalProfit = 0;
    let tableRows = '';

    for (let acc in accountsData) {
        let d = accountsData[acc];
        let closing = d.opening + d.cashIn - d.cashOut;
        
        totalOpening += d.opening;
        totalCashIn += d.cashIn;
        totalCashOut += d.cashOut;
        totalClosing += closing;
        totalProfit += d.profit;

        tableRows += `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #ddd; font-weight: bold; display: flex; align-items: center; gap: 10px;">
                    <img src="${d.logo}" alt="${acc}" style="width: 32px; height: 32px; object-fit: contain; border-radius: 50%; background: #fff; padding: 2px; border: 1px solid #ddd;"> ${acc}
                </td>
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
            <title>Ahmad Karyan Store - Professional Dashboard</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f6f9; margin: 0; padding: 20px; }
                .container { max-width: 1100px; margin: auto; background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
                .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2e7d32; padding-bottom: 15px; margin-bottom: 25px; }
                .profile-section { display: flex; align-items: center; gap: 15px; text-decoration: none; color: inherit; }
                .profile-section img { width: 55px; height: 55px; border-radius: 50%; object-fit: cover; border: 2px solid #2e7d32; background: #fff; transition: 0.2s; }
                .profile-section img:hover { transform: scale(1.05); border-color: #1b5e20; }
                .logout-btn { background: #d32f2f; color: white; padding: 8px 15px; text-decoration: none; border-radius: 5px; font-size: 14px; font-weight: bold; }
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
                    <a href="/profile" class="profile-section" title="Click to view Profile Details">
                        <img src="${userProfile.dp}" alt="Profile DP">
                        <div>
                            <h2 style="margin: 0; color: #1b5e20; font-size: 22px;">🛒 Ahmad Karyan Store</h2>
                            <p style="margin: 0; color: #666; font-size: 13px;">Owner: ${userProfile.name} | <span style="color: #2e7d32; text-decoration: underline;">View Profile</span></p>
                        </div>
                    </a>
                    <div>
                        <a href="/logout" class="logout-btn">Secure Logout</a>
                    </div>
                </div>

                <!-- Summary Cards -->
                <div class="summary-cards">
                    <div class="card">
                        <h3>Total Opening Balance</h3>
                        <p>Rs. ${totalOpening.toLocaleString()}</p>
                    </div>
                    <div class="card">
                        <h3>Total Cash In</h3>
                        <p style="color: green;">Rs. ${totalCashIn.toLocaleString()}</p>
                    </div>
                    <div class="card">
                        <h3>Total Cash Out</h3>
                        <p style="color: red;">Rs. ${totalCashOut.toLocaleString()}</p>
                    </div>
                    <div class="card" style="border-left-color: #0d47a1; background: #e3f2fd;">
                        <h3>Total Expected Profit</h3>
                        <p style="color: #0d47a1;">Rs. ${totalProfit.toLocaleString()}</p>
                    </div>
                </div>

                <!-- Main Accounts Table -->
                <h2>📊 Bank & JazzCash Accounts Overview</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Account Name</th>
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
                    <h3 style="margin-top: 0; color: #2e7d32;">➕ Add New Transaction</h3>
                    <form action="/add-transaction" method="POST">
                        <div class="form-row">
                            <select name="account" required>
                                <option value="">Select Account</option>
                                <option value="JazzCash">JazzCash</option>
                                <option value="EasyPaisa">EasyPaisa</option>
                                <option value="Bank Alfalah">Bank Alfalah</option>
                                <option value="JazzCash Business">JazzCash Business</option>
                            </select>
                            <select name="type" required>
                                <option value="Cash In">Cash In (Deposit)</option>
                                <option value="Cash Out">Cash Out (Withdraw)</option>
                            </select>
                            <input type="number" name="amount" placeholder="Amount (Rs)" required>
                            <input type="number" name="profit" placeholder="Profit / Commission" required>
                            <input type="text" name="customer" placeholder="Customer Name / Number" required>
                        </div>
                        <button type="submit">Save Transaction</button>
                    </form>
                </div>

                <!-- Recent Transactions Log -->
                <h3 style="margin-top: 30px;">🕒 Recent Transactions History</h3>
                <table style="font-size: 14px;">
                    <thead>
                        <tr style="background: #37474f; color: white;">
                            <th style="padding: 10px;">Time</th>
                            <th style="padding: 10px;">Account</th>
                            <th style="padding: 10px;">Type</th>
                            <th style="padding: 10px;">Amount</th>
                            <th style="padding: 10px;">Customer</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${logsHtml || '<tr><td colspan="5" style="text-align:center; padding:10px;">No transactions found.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </body>
        </html>
    `);
});

app.post('/update-dp', upload.single('dpImage'), (req, res) => {
    if (!req.session.isAuthenticated) return res.redirect('/login');
    if (req.file) {
        userProfile.dp = '/uploads/' + req.file.filename;
    }
    res.redirect('/profile');
});

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

    let currentTime = new Date().toLocaleTimeString();
    transactionLogs.push({
        time: currentTime,
        account,
        type,
        amount: amt.toLocaleString(),
        customer
    });

    res.redirect('/');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log('Ahmad Karyan Store Secure Portal running on port ' + PORT);
});
