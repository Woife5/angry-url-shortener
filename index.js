const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');

const Short = require('./model');

// Get environment variables
const { PORT = 3000, DATABASE_URL = 'mongodb://root:example@localhost:27017/' } = process.env;

// use: docker run -d -e MONGO_INITDB_ROOT_USERNAME=root -e MONGO_INITDB_ROOT_PASSWORD=example -p 27017:27017 mongo
// to create a dev container with mongo

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './public')));

if (DATABASE_URL) {
    mongoose.connect(DATABASE_URL);
} else {
    // Maybe in-memory storage sometime?
    throw new Error('DATABASE_URL is not set');
}

app.post('/api/shorten', async (req, res) => {
    let requestedPath = req.body.requestedPath;
    let providedUrl = req.body.providedUrl;

    if (!providedUrl || providedUrl.trim().length === 0) {
        return res.status(400).json({ message: 'Please specify an URL to be shortened' });
    } else {
        providedUrl = providedUrl.trim();
    }

    // Make sure the requested Path is URL safe
    if (requestedPath && requestedPath.trim().length > 0) {
        requestedPath = requestedPath.trim();
        requestedPath = encodeURIComponent(requestedPath);
    } else {
        requestedPath = null;
    }

    try {
        const url = await Short.findOne({ shortPath: requestedPath }).exec();
        if (url) {
            return res.status(400).json({
                message:
                    'The provided URL is already in use. This can also happen when the randomly generated URL already exists, in that case just try again.',
            });
        } else {
            const saved = await shorten(providedUrl, requestedPath);
            return res.status(200).json({
                message: 'URL successfully shortened',
                url: `${req.protocol}://${req.get('host')}/${saved.shortPath}`,
                pointingTo: saved.url,
            });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

app.get('/api/:url', async (req, res) => {
    const shortPath = encodeURIComponent(req.params.url);

    try {
        const url = await Short.findOne({ shortPath: shortPath }).exec();
        if (url) {
            return res.json(url);
        } else {
            return res.status(404).json({ message: 'URL not found' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

app.get('/:url', async (req, res, next) => {
    const shortPath = encodeURIComponent(req.params.url);

    try {
        const url = await Short.findOne({ shortPath: shortPath }).exec();
        if (url) {
            url.lastUsed = Date.now();
            url.uses += 1;
            await url.save();
            return res.redirect(301, url.url);
        } else {
            return next();
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

/**
 * Shortend a given url
 * @param {string} url URL to be pointed to
 * @param {string} path Shortend path, defaults to random string
 * @returns The object containing the shortend URL and the original URL
 */
async function shorten(url, path = null) {
    if (!url.startsWith('http')) {
        url = `http://${url}`;
    }

    if (!path) {
        // Create a new random short path
        path = getRandomString(6);
    }

    const newUrl = await Short.create({
        shortPath: path,
        url,
    });

    return newUrl;
}

/**
 * @param {number} length The length of the string to be generated
 * @returns A randomly generated string containing URL safe characters
 */
function getRandomString(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_*().';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
