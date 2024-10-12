const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
require("dotenv").config();

app.get("/gold-price", async (req, res) => {
    const executablePath = process.env.NODE_ENV === 'production' 
        ? process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser'
        : puppeteer.executablePath();

    let options = {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
        ],
        executablePath: executablePath,
    };

    try {
        console.log('Launching Puppeteer with options:', options);
        const browser = await puppeteer.launch(options);
        const page = await browser.newPage();

        await page.goto('https://www.google.com/search?q=gold+price', {
            waitUntil: 'domcontentloaded',
        });

        const goldHandles = await page.$$('.vlzY6d');

        let goldValues = [];

        for (const goldInfo of goldHandles) {
            const val = await page.evaluate(
                el => el.querySelector("g-card-section > div.vlzY6d > span:nth-child(1)").textContent,
                goldInfo
            );
            console.log(val);
            goldValues.push(val);
        }

        await browser.close();
        res.json({ goldPrices: goldValues });
    } catch (err) {
        console.error('Error fetching gold price:', err);
        res.status(500).send('Failed to fetch gold price');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

module.exports = app;
