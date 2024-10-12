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
        '--disable-dev-shm-usage', // Use /tmp instead of /dev/shm
      ],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath, // Ensure this is the correct path
      headless: true,
      ignoreHTTPSErrors: true,
    };
  } else {
    options = {
      headless: true,
      defaultViewport: false
    };
  }

  try {
    console.log("Launching browser...");
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
      goldValues.push(val);
    }

    await browser.close();
    res.json({ goldPrices: goldValues });
  } catch (err) {
    console.error("Error during scraping:", err);
    res.status(500).send(`Failed to fetch gold price: ${err.message}`);
  }
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});

module.exports = app;

