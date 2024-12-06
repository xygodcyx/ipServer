const express = require("express");
const path = require("path");
const app = express();
// const cheerio = require('cheerio');

// Geolocation scraping function
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);  // 发送 200 响应表示允许预检请求
    }
    next();
});

app.use("/locale", require("./router/locale"))

app.get("/", function (req, res) {
    res.send("服务器启动成功！")
})


// await scrapeGeolocation('3.113.23.210');

// Start the express server
app.listen(7788, () => {
    console.log("Server is running on http://localhost:7788");
});
