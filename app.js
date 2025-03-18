const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/click-button', async (req, res) => {
    const { url, buttonSelector } = req.body;

    if (!url || !buttonSelector) {
        return res.status(400).json({ error: "Missing required parameters (url, buttonSelector)" });
    }

    try {
        const browser = await puppeteer.launch({ headless: false }); // headless:false כדי לראות
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        // מחכים שהכפתור יופיע
        await page.waitForSelector(buttonSelector, { timeout: 5000 });

        // מאזינים לאירוע של פתיחת דף חדש
        const [newPage] = await Promise.all([
            new Promise(resolve => browser.once('targetcreated', async target => {
                const newPage = await target.page();
                resolve(newPage);
            })),
            page.click(buttonSelector) // לחיצה על הכפתור
        ]);

        if (newPage) {
            await newPage.waitForTimeout(3000); // מוודאים שהעמוד נטען
            const newPageUrl = newPage.url(); // שליפת ה-URL של הדף החדש
            await browser.close();
            return res.json({ success: true, newPageUrl });
        } else {
            await browser.close();
            return res.status(500).json({ success: false, error: "No new page detected" });
        }

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// הפעלת השרת
app.listen(3000, () => {
    console.log('Puppeteer server is running on http://localhost:3000');
});
