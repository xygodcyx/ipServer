(() => {
    const puppeteer = require('puppeteer');
    const express = require("express");
    const cheerio = require('cheerio');
    const cors = require("cors");
    const app = express();


    app.use(express.json());
    app.use(cors());

    app.get("/:ip", async (req, res) => {
        const {ip} = req.params;
        try {
            const browser = await puppeteer.launch({headless: true});  // 启动浏览器实例
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

    // Geolocation scraping function
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
            await page.close();
        }
    }

    // Test the function with the provided IP (Uncomment for testing)
    // await scrapeGeolocation('3.113.23.210');

    // Start the express server
    app.listen(7788, () => {
        console.log("Server is running on http://localhost:7788");
    });
})();
