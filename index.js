const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
require("dotenv").config();

app.get("/gold-price", async (req, res) => {
  const executablePath = process.env.NODE_ENV === 'production'
      ? process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome-stable'
      : puppeteer.executablePath();

  let options = {
      headless: 'new',
      args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
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

      await page.waitForSelector('.vlzY6d', { timeout: 5000 });
      const goldHandles = await page.$$('.vlzY6d');

      let goldValues = [];
      for (const goldInfo of goldHandles) {
          const val = await page.evaluate(el => el.innerText, goldInfo);
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
