
require('dotenv').config();
const express = require('express');
const request = require('request');
const app = express();
const PORT = process.env.PORT || 5000

app
    .get('/auth', (req, res) => {
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
            var JSONresponse = JSON.parse(body);
            if (!JSONresponse.ok) {
                console.log(JSONresponse);
                res.send("Error encountered: \n" + JSON.stringify(JSONresponse)).status(200).end();
            } else {
                console.log(body, JSONresponse);
                res.send("Success!");
            }
        });
    })
    .listen(PORT, () => console.log(`Listening on ${ PORT }`));