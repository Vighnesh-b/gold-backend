const express = require('express');
const app = express();
let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION || process.env.VERCEL) {
  chrome = require('chrome-aws-lambda');
  puppeteer = require('puppeteer-core');
} else {
  puppeteer = require('puppeteer');
}

app.get("/gold-price", async (req, res) => {
  let options = {};

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION || process.env.VERCEL) {
    options = {
      args: [
        ...chrome.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    };
  } else {
    options = {
      headless: true, // Ensure headless mode for local testing too
      defaultViewport: false,
    };
  }

  try {
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();

    await page.goto('https://www.google.com/search?q=gold+price', {
      waitUntil: 'domcontentloaded',
    });

    const goldHandles = await page.$$('.vlzY6d');
    const goldHandles = await page.$$('.vlzY6d'); // Keep your selector as requested

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

app.listen(3000, () => {
  console.log("Server started on port 3000");
});

module.exports = app;
