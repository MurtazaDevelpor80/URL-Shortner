const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const validUrl = require('valid-url');

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/url_shortener', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// URL schema and model
const urlSchema = new mongoose.Schema({
    originalUrl: String,
    shortUrl: String,
});
const Url = mongoose.model('Url', urlSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route for the home page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Route to shorten a URL
app.post('/shorten', async (req, res) => {
    const originalUrl = req.body.url;

    if (!validUrl.isUri(originalUrl)) {
        return res.status(401).send('Invalid URL');
    }

    const shortUrl = Math.random().toString(36).substring(2, 8); // Generate a random short URL

    const newUrl = new Url({ originalUrl, shortUrl });
    await newUrl.save();

    res.send(`Shortened URL: <a href="/${shortUrl}">/${shortUrl}</a>`);
});

// Route to redirect to the original URL
app.get('/:shortUrl', async (req, res) => {
    const shortUrl = req.params.shortUrl;
    const urlData = await Url.findOne({ shortUrl });

    if (urlData) {
        return res.redirect(urlData.originalUrl);
    } else {
        return res.status(404).send('URL not found!');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
