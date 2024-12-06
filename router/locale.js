// const puppeteer = require("puppeteer");
// const chromium = require("chrome-aws-lambda");
const router = require("express").Router()
const chrome = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
const production = process.env.NODE_ENV === 'production';

router.get("/", async (req, res) => {
    const {ip} = req.query;
    try {
        const locale = await scrapeGeolocation(ip);
        console.log(`获取成功：ip为${ip}的用户位于${locale.slice(0, -4)}`)
        res.send({
            data: locale
        });
    } catch (error) {
        console.error("Error fetching:", error.message);
        res.status(500).send({error: "Failed to fetch."});
    }
});


async function scrapeGeolocation(ip) {
    try {
        console.log(`Fetching geolocation data for IP: ${ip}`);

        // Fetch the data using simulateClickAndGetData
        // const $ = cheerio.load(data)
        // const tianwangLocale = $("tbody > tr:nth-child(6) > td").text()
        // console.log(tianwangLocale)
        // return tianwangLocale
        return await simulateClickAndGetData(ip)
    } catch (error) {
        console.error('Error fetching geolocation data:', error);
        throw error;  // Rethrow to be caught by the express route
    }
}

// Simulate clicking and extracting geolocation data
async function simulateClickAndGetData(ip) {
    // const browser = await puppeteer.launch({
    //     executablePath: await chromium.executablePath,
    //     args: chromium.args,
    //     headless: chromium.headless,
    //     defaultViewport: chromium.defaultViewport,
    // });
    // const browser = await puppeteer.connect({browserWSEndpoint: 'wss://chrome.browserless.io?token=YOUR_TOKEN_HERE'})
    const browser = await puppeteer.launch(
        production ? {
            args: chrome.args,
            defaultViewport: chrome.defaultViewport,
            executablePath: await chrome.executablePath(),
            headless: 'new',
            ignoreHTTPSErrors: true
        } : {
            headless: 'new',
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        }
    );
    const page = await browser.newPage();
    try {
        // Navigate to the page
        await page.goto("https://www.sojson.com/ip/12OoOYiJmUuJl1yJl4eJm.html", {waitUntil: 'load'});

        // Wait for the input to be available and fill in the IP address
        await page.waitForSelector('#url');
        await page.locator('#url').fill(ip);

        // Wait for the button to be clickable and click it
        await page.waitForSelector('#so_box > div.layui-row.pt10.layui-form > div:nth-child(1) > button');
        await page.click('#so_box > div.layui-row.pt10.layui-form > div:nth-child(1) > button');

        // Wait for the results table to appear
        await page.waitForSelector('#so_box > div:nth-child(4) > div.layui-col-md9 > div:nth-child(1) > div > div > div > table');

        // Extract the table data

        return await page.evaluate(() => {
            return document.querySelector('#so_box > div:nth-child(4) > div.layui-col-md9 > div:nth-child(1) > div > div > div > table > tbody > tr:nth-child(6) > td').innerText;
        });  // Return the extracted data
    } catch (error) {
        console.error('Error during scraping:', error);
        throw error;  // Throw error if something goes wrong
    } finally {
        // Don't close the browser here, leave it open for further requests
        // await page.close();
    }
}


module.exports = router