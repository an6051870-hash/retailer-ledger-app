const express = require('express');
const cron = require('node-cron');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ٹرانزكشنز کو محفوظ کرنے کی لسٹ
let transactions = [];

// ہوم پیج اور انٹری فارम
app.get('/', (req, res) => {
    let totalCashIn = 0;
    let totalCashOut = 0;
    let totalProfit = 0;

    transactions.forEach(t => {
        let amt = parseFloat(t.amount) || 0;
        if (t.type.includes('Cash In')) {
            totalCashIn += amt;
            // فرض کریں ہر جاز کیش ڈپازٹ پر اوسطاً کچھ کمیشن/پرافٹ بنتا ہے (مثلاً 1%) یا فکسڈ
            totalProfit += (amt * 0.005); 
        } else {
            totalCashOut += amt;
        }
    });

    let html = `
        <div style="font-family: Arial; max-width: 650px; margin: 30px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background: #f9f9f9;">
            <h1 style="color: #e60000; text-align: center;">Ahmad Karyan Store</h1>
            <h3 style="text-align: center; color: #333;">JazzCash & Multi-Bank Ledger</h3>
            <hr>

            <!-- Daily Summary Card -->
            <div style="background: #fff; padding: 15px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 0 5px rgba(0,0,0,0.1);">
                <h3>آج کا خلاصہ (Daily Summary)</h3>
                <p><b>کل موصول رقم (Cash In):</b> <span style="color: green;">Rs. ${totalCashIn}</span></p>
                <p><b>کل بھیجی گئی رقم (Cash Out):</b> <span style="color: red;">Rs. ${totalCashOut}</span></p>
                <p><b>کل اندازہً پرافٹ/کمیشن:</b> <span style="color: blue; font-weight: bold;">Rs. ${totalProfit.toFixed(2)}</span></p>
            </div>
            
            <!-- Entry Form -->
            <form action="/add-entry" method="POST" style="background: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 0 5px rgba(0,0,0,0.1);">
                <h3>نئی بینک / جاز کیش انٹری</h3>
                <div style="margin-bottom: 10px;">
                    <label>اکاؤنٹ کا نام (مثلاً JazzCash / HBL / EasyPaisa):</label><br>
                    <input type="text" name="account" required style="width: 100%; padding: 8px; margin-top: 5px; box-sizing: border-box;">
                </div>
                <div style="margin-bottom: 10px;">
                    <label>کسٹمر کا نام / نمبر:</label><br>
                    <input type="text" name="customer" required style="width: 100%; padding: 8px; margin-top: 5px; box-sizing: border-box;">
                </div>
                <div style="margin-bottom: 10px;">
                    <label>رقم (Amount):</label><br>
                    <input type="number" name="amount" required style="width: 100%; padding: 8px; margin-top: 5px; box-sizing: border-box;">
                </div>
                <div style="margin-bottom: 10px;">
                    <label>قسم (Type):</label><br>
                    <select name="type" style="width: 100%; padding: 8px; margin-top: 5px;">
                        <option value="Cash In (رقم آئی)">Cash In (رقم آئی / Deposit)</option>
                        <option value="Cash Out (رقم دی)">Cash Out (رقم دی / Withdraw)</option>
                    </select>
                </div>
                <button type="submit" style="background: #e60000; color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer; width: 100%; font-size: 16px;">انٹری سیو کریں</button>
            </form>

            <hr style="margin-top: 30px;">

            <!-- Transactions List -->
            <h3>تمام لین دین کا ریکارڈ</h3>
            <ul style="padding-left: 20px;">
    `;

    if (transactions.length === 0) {
        html += `<p style="color: #777;">ابھی تک کوئی انٹری نہیں کی گئی۔</p>`;
    } else {
        transactions.forEach((t, index) => {
            let color = t.type.includes('Cash In') ? 'green' : 'red';
            html += `<li style="margin-bottom: 10px; background: #fff; padding: 10px; border-radius: 5px;">
                <b>[${t.account}]</b> نام: ${t.customer} | 
                رقم: <span style="color: ${color}; font-weight: bold;">Rs. ${t.amount}</span> | 
                ${t.type}
            </li>`;
        });
    }

    html += `
            </ul>
        </div>
    `;

    res.send(html);
});

// انٹری سیو کرنے کا راستہ
app.post('/add-entry', (req, res) => {
    const { account, customer, amount, type } = req.body;
    transactions.push({ account, customer, amount, type });
    res.redirect('/');
});

// ہر رات ٹھیک 9 بجے آٹومیٹڈ رپورٹ کا نظام (Cron Job for 9:00 PM)
cron.schedule('0 21 * * *', () => {
    console.log('--- رات کے 9 بج چکے ہیں: جاز کیش اور بینک رپورٹ تیار ہے ---');
    let totalProfit = 0;
    transactions.forEach(t => {
        let amt = parseFloat(t.amount) || 0;
        if (t.type.includes('Cash In')) {
            totalProfit += (amt * 0.005);
        }
    });
    console.log(`آج کا کل پرافٹ: Rs. ${totalProfit.toFixed(2)}`);
    // یہاں ہم چاہیں تو ای میل یا واٹس ایپ API بھی لگا سکتے ہیں
}, {
    scheduled: true,
    timezone: "Asia/Karachi"
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log('Ahmad Karyan Store App running on port ' + PORT);
});
