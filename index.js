const express = require('express');
const app = express();
let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require('chrome-aws-lambda');
  puppeteer = require('puppeteer-core');
} else {
  puppeteer = require('puppeteer');
}

app.get("/gold-price", async (req, res) => {
  let options = {};

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    };
  } else {
    options = { headless: true, defaultViewport: false };
  }

  try {
    console.log("Launching browser...");
    const browser = await puppeteer.launch(options);

    console.log("Opening new page...");
    const page = await browser.newPage();

    console.log("Navigating to Google search...");
    await page.goto('https://www.google.com/search?q=gold+price', {
      waitUntil: 'domcontentloaded',
    });

    console.log("Extracting gold prices...");
    const goldHandles = await page.$$('.vlzY6d');

    if (goldHandles.length === 0) {
      throw new Error("No gold prices found on the page.");
    }

    let goldValues = [];
    for (const goldInfo of goldHandles) {
      const val = await page.evaluate(
        el => el.querySelector("g-card-section > div.vlzY6d > span:nth-child(1)").textContent,
        goldInfo
      );
      console.log(`Found gold price: ${val}`);
      goldValues.push(val);
    }

    await browser.close();
    res.json({ goldPrices: goldValues });
  } catch (err) {
    console.error("Error during scraping:", err);
    res.status(500).send(`Failed to fetch gold price: ${err.message}`);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});

module.exports = app;

