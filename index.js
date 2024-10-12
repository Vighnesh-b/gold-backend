
const app = require('express')();
let chrome = {};
let puppeteer;
if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require('chrome-aws-lambda');
  puppeteer = require('puppeteer-core');
}
else {
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
  }

  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: false,
    });
    const page = await browser.newPage();
    await page.goto('https://www.google.com/search?q=gold+price');

    const goldhandles = await page.$$('.vlzY6d');
    for (const goldinfo of goldhandles) {

      const val = await page.evaluate(el => el.querySelector(" g-card-section > div.vlzY6d > span:nth-child(1)").textContent, goldinfo);
      console.log(val);
      res.send(val);
    }
  }
  catch(err) {
    console.error(err);
    return null;
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});

module.exports = app;
