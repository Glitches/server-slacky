require("dotenv").config();
const express = require("express");
const request = require("request");
const app = express();
const Raven = require("raven");
const https = require("https");
const qs = require("qs");
const cors = require("cors");
const metascraper = require("metascraper");
const got = require("got");

const PORT = process.env.PORT || 5000;
// Must configure Raven before doing anything else with it
Raven.config(process.env.__DSN__).install();

app
  .use(Raven.requestHandler())
  .use(cors())
  .get("/auth", (req, res) => {
    console.log(req.originalUrl);
    res.sendFile(__dirname + "/static/add_to_slack.html");
  })
  .get("/auth/redirect", async (req, res) => {
    try {
      var options = {
        uri:
          "https://slack.com/api/oauth.access?code=" +
          req.query.code +
          "&client_id=" +
          process.env.CLIENT_ID +
          "&client_secret=" +
          process.env.CLIENT_SECRET +
          "&redirect_uri=" +
          process.env.REDIRECT_URI,
        method: "GET"
      };
      await request(options, (error, response, body) => {
        const JSONresponse = JSON.parse(body);
        if (!JSONresponse.ok) {
          console.log(JSONresponse);
          res
            .send("Error encountered: \n" + JSON.stringify(JSONresponse))
            .status(200)
            .end();
        } else {
          console.log(JSONresponse);
          res.send(`Success! ${JSONresponse.access_token}`);
        }
      });
    } catch (e) {
      console.log("/auth", e);
    }
  })
  .get("/validate", async (req, res) => {
    try {
      const { code } = qs.parse(req.url.split("?")[1]);
      const options = {
        uri:
          "https://slack.com/api/oauth.access?" +
          qs.stringify({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            code,
            redirect_uri: process.env.REDIRECT_URI
          })
      };
      await request(options, (error, response, body) => {
        if (error) return console.error(errror);

        res.json(body);
      });
    } catch (e) {
      console.log("/validate ", e);
    }
  })
  .get("/preview", async (req, res) => {
    try {
      const targetUrl = req.query.uri;
      if (targetUrl.match(/^chrome+/)) return null;
      else {
        console.log(targetUrl);
        (async () => {
          const { body: html, url } = await got(targetUrl);
          const metadata = await metascraper({ html, url });
          res.send(metadata);
        })();
      }
    } catch (e) {
      console.log("/preview ", e);
    }
  })
  .use(function onError(err, req, res, next) {
    // The error id is attached to `res.sentry` to be returned
    // and optionally displayed to the user for support.
    res.statusCode = 500;
    res.end(res.sentry + "\n");
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
