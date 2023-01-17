require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const mUrls = require(`${__dirname}/urlModel`)
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const Url = require('url');
const mongoSanitize = require('express-mongo-sanitize');
var xss = require('xss-clean')


const DB = process.env.DATABASE_URL.replace('<password>', process.env.DATABASE_PASSWORD)

mongoose.set('strictQuery', true);

mongoose.connect(DB).then((con) => {
  console.log('Database connection sucessfull');
}).catch((err) => {
  process.exit(0)
});


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(xss())
app.use(mongoSanitize());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async (req, res) => {
  const { url } = req.body;
  const { hostname } = Url.parse(url);
  if (!hostname) {
    return res.status(200).json({
      error: 'invalid url'
    })
  }
  dns.lookup(hostname, async (err, address) => {
    if (err) {
      return res.status(200).json({
        error: 'invalid url'
      })
    } else {
      let urlExits = await mUrls.findOne({ original_url: url })
      if (urlExits) {
        return res.status(200).json(urlExits);
      }
      let urls = await mUrls.find();
      let urlData = {
        original_url: url,
        short_url: urls.length + 1
      }
      let shortUrl = await mUrls.create(urlData)
      return res.status(200).json({ original_url: shortUrl.original_url, short_url: shortUrl.short_url });
    }
  });
  //res.json({ greeting: 'hello API' });
})

app.get('/api/shorturl/:id', async (req, res) => {
  const { id } = req.params;
  const { original_url } = await mUrls.findOne({ short_url: id });
  if (!original_url) {
    res.status(200).json({ error: "No short URL found for the given input" })
  }
  res.redirect(original_url);
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

