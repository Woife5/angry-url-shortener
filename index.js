const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './public')));

const shortend = new Map();

app.post('/new', (req, res) => {
    console.log(req.body);
    return res.send('ok');
    const reqestedUrl = req.body.reqestedUrl;
    const providedUrl = req.body.providedUrl;

    if (!shortend.has(reqestedUrl)) {
        shortend.set(reqestedUrl, providedUrl);
        res.send({
            shortendUrl: reqestedUrl,
        });
    }
});

app.get('/:url', (req, res, next) => {
    const url = req.params.url;
    const providedUrl = shortend.get(url);
    if (!providedUrl) {
        next();
    }
    res.redirect(providedUrl);
});

app.listen(3000, () => {
    console.log(`Listening on port ${3000}`);
});
