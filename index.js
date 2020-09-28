const express = require("express");
const xhub = require("express-x-hub");
const body_parser = require("body-parser");
const dotenv_flow = require("dotenv-flow");
const fetch = require("node-fetch");
const moment = require("moment");

// Setup environment

dotenv_flow.config();

const fb_verify_token = process.env.FB_VERIFY_TOKEN;
if (!fb_verify_token) {
    console.error("Please provide your verify token for Facebook inside process.env.FB_VERIFY_TOKEN");
    return process.exit(1);
}

const fb_app_secret = process.env.FB_APP_SECRET;
if (!fb_app_secret) {
    console.error("Please provide your Facebook app secret inside process.env.FB_APP_SECRET");
    return process.exit(1);
}

const fb_user_id = process.env.FB_USER_ID;
if (!fb_user_id) {
    console.error("Please provide your Facebook user id inside process.env.FB_USER_ID");
    return process.exit(1);
}

const fb_access_token = process.env.FB_ACCESS_TOKEN;
if (!fb_access_token) {
    console.error("Please provide your Facebook access token inside process.env.FB_ACCESS_TOKEN");
    return process.exit(1);
}

// Setup Express server

const app = express();
app.set("port", process.env.PORT || 5000);

app.use(xhub({ algorithm: "sha1", secret: fb_app_secret }))
app.use(body_parser.json());

app.get("/", (req, res) => res.status(200).send({ message: "Come ti chiami?" }));

app.get("/facebook", (req, res) => {
    if (
        req.query["hub.mode"] == "subscribe" &&
        req.query["hub.verify_token"] == fb_verify_token
    ) {
        return res.status(200).send(req.query["hub.challenge"]);
    }

    res.status(400).send({ message: "Invalid query params!" });
});

app.post("/facebook", (req, res) => {
    if (!req.isXHubValid()) {
        console.error("Got an invalid X-Hub signature!");
        return res.status(401).send("Invalid SHA-1 signature in X-Hub header!");
    }

    const [ { changes, time } ] = req.body;
    const [ { field } ] = changes[0];
    if (field !== "feed") {
        // Wasn't an update to my feed
        return res.sendStatus(200);
    }

    fetch(`${process.env.FB_GRAPH_URL}/${fb_user_id}/posts?access_token=${fb_access_token}`)
        .then(res => res.json())
        .then(({ data }) => {
            // Filter only posts with a 30 seconds or less difference from the Webhook time, get the first one
            // I assume Rome timezone since I'm the only user of this shit
            // If you are using this thing from a different timezone, change the offset here (created_time needs to be changed, time is already offseted by FB)
            const [ post ] = data.filter(({ created_time }) => moment(created_time).zone("+0200").diff(moment(time), "seconds") < 30);
            fetch(`${process.env.FB_GRAPH_URL}/${fb_user_id}/posts?access_token=${fb_access_token}`)
        });
});

app.listen(app.get("port"));
