
require('dotenv').config();
const express = require('express');
const request = require('request');
const app = express();
const https = require('https');
const qs = require('qs');
const cors = require('cors');
const metascraper = require('metascraper')
const got = require('got')

// const targetUrl = 'http://www.bloomberg.com/news/articles/2016-05-24/as-zenefits-stumbles-gusto-goes-head-on-by-selling-insurance'

;
(async() => {
    const {
        body: html,
        url
    } = await got(targetUrl)
    const metadata = await metascraper({
        html,
        url
    })
    console.log(metadata)
})()

const PORT = process.env.PORT || 5000;

app
    .use(cors())
    .get('/auth', (req, res) => {
        console.log(req.originalUrl);
        res.sendFile(__dirname + '/static/add_to_slack.html');
    })
    .get('/auth/redirect', (req, res) => {
        var options = {
            uri: 'https://slack.com/api/oauth.access?code='
      + req.query.code +
      '&client_id=' + process.env.CLIENT_ID +
      '&client_secret=' + process.env.CLIENT_SECRET +
      '&redirect_uri=' + process.env.REDIRECT_URI,
            method: 'GET'
        };
        request(options, (error, response, body) => {
            const JSONresponse = JSON.parse(body);
            if (!JSONresponse.ok) {
                console.log(JSONresponse);
                res.send('Error encountered: \n' + JSON.stringify(JSONresponse)).status(200).end();
            } else {
                console.log(JSONresponse);
                res.send(`Success! ${JSONresponse.access_token}`);
            }
        });
    })
    .get('/validate', (req, res) => {
        // http://host/path?code=123
        const { code } = qs.parse(req.url.split('?')[1]);
        const options = {
            uri: 'https://slack.com/api/oauth.access?' +
          qs.stringify({
              client_id: process.env.CLIENT_ID,
              client_secret: process.env.CLIENT_SECRET,
              code,
              redirect_uri: process.env.REDIRECT_URI
          }),
        };
        request(options, (error, response, body) => {
            if(error) return console.error(errror);

            res.json(body);
        });
    })
    .get('/preview', (req, res) => {
        const targetUrl = req.query.uri;
        console.log(targetUrl);
        (async() => {
            const {
                body: html,
                url
            } = await got(targetUrl)
            const metadata = await metascraper({
                html,
                url
            })
            // console.log(metadata)
            res.send(metadata);

        })()
    })
    .listen(PORT, () => console.log(`Listening on ${ PORT }`));
