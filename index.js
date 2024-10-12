const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
require("dotenv").config();

app.get("/gold-price", async (req, res) => {
    const executablePath = process.env.NODE_ENV === 'production'
        ? '/usr/bin/google-chrome-stable'
        : puppeteer.executablePath();

    console.log('Using executable path:', executablePath);

    const options = {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--disable-background-networking',
            '--disable-renderer-backgrounding',
            '--disable-software-rasterizer',
            '--mute-audio',
            '--headless=new',
        ],
        executablePath,
    };

    try {
        const browser = await puppeteer.launch(options);
        const page = await browser.newPage();

        await page.goto('https://www.google.com/search?q=gold+price', {
            waitUntil: 'domcontentloaded',
            timeout: 60000,
        });

        const goldValues = await page.$$eval('.vlzY6d span:nth-child(1)', spans =>
            spans.map(span => span.textContent.trim())
        );

        await browser.close();
        console.log('Gold Prices:', goldValues);
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

