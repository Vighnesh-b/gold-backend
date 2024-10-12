const express = require('express');
const app = express();
require("dotenv").config();

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

app.get("/gold-price", async (req, res) => {
    const executablePath = process.env.NODE_ENV === 'production'
        ? '/usr/bin/google-chrome-stable'
        : puppeteer.executablePath();

    let options = {
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--window-size=1280,800',
        ],
        executablePath: executablePath,
    };

    try {
        const browser = await puppeteer.launch(options);
        const page = await browser.newPage();
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36'
        );

        await page.goto('https://www.google.com/search?q=gold+price', {
            waitUntil: 'networkidle2',
        });

        await page.waitForSelector('.vlzY6d', { timeout: 15000 });
        const priceElement = await page.$('.vlzY6d');
        const goldPrice = await page.evaluate(el => el.textContent, priceElement);

        console.log(goldPrice);
        await browser.close();
        res.json({ goldPrice });
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
