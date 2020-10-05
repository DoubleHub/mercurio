import fetch from "node-fetch";
import moment from "moment";
import express from "express";
import { env } from "@env";

export default function(app: express.Application) {
	app.get("/facebook", (req, res) => {
		if (req.query["hub.mode"] !== "subscribe" || req.query["hub.verify_token"] !== env.fb.verify_token)
			return res.status(400).send({ message: "Invalid query params!" });

		res.status(200).send(req.query["hub.challenge"]);
	});

	app.post("/facebook", (req, res) => {
		if (!req.isXHubValid()) {
			console.error("Got an invalid X-Hub SHA-1 signature!");
			return res.status(401).send("Invalid SHA-1 signature in X-Hub header!");
		}

		const [ { changes, time } ] = req.body;
		const [ { field } ] = changes[0];
		if (field !== "feed") {
			// Wasn't an update to my feed
			return res.sendStatus(200);
		}

		fetch(`${process.env.FB_GRAPH_URL}/${env.fb.user_id}/posts?access_token=${env.fb.access_token}`)
			.then(res => res.json())
			.then(({ data }) => {
				// Filter only posts with a 30 seconds or less difference from the Webhook time, get the first one
				// I assume Rome timezone since I'm the only user of this shit
				// If you are using this thing from a different timezone, change the offset here (created_time needs to be changed, time is already offseted by FB)
				const [ post ] = data.filter(({ created_time }) => moment(created_time).zone("+0200").diff(moment(time), "seconds") < 30);
				console.log(JSON.stringify(post, null, 2));
			});
	});
}
