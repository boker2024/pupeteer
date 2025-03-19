const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/click-button", async (req, res) => {
    const { url,selector } = req.body;

    if (!url||!selector) {
        return res.status(400).json({ error: "Missing required parameter: url|selector" });
    }

    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        await page.goto(url, { waitUntil: "networkidle2" });

        // מחכים שהלינק יופיע
        await page.waitForSelector(selector, { timeout: 5000 });

        // שליפת href
        const pdfLink = await page.evaluate(() => {
            const linkElement = document.querySelector(".p-pdf-link");
            return linkElement ? linkElement.getAttribute("href") : null;
        });

        await browser.close();

        res.json({ success: true, pdfLink });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// הפעלת השרת על פורט 3000
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
