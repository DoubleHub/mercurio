import fetch from "node-fetch";
import moment from "moment";
import express, { Request } from "express";
import { get_env } from "@env";
import { log } from "../utils/log";

export interface FBPostsResponse {
	data: Array<{
		created_time: string;
		id: string;
	}>;
}

export interface FBPost {
	link: string; // The link attached to this post.
	type: string; // A string indicating the object type of this post.
	// TODO Continua mappatura della risposta
}

export default function(app: express.Application) {
	const env = get_env();

	app.get("/facebook", (req, res) => {
		if (req.query["hub.mode"] !== "subscribe" || req.query["hub.verify_token"] !== env.fb.verify_token)
			return res.status(400).send({ message: "Invalid query params!" });

		res.status(200).send(req.query["hub.challenge"]);
	});

	app.post("/facebook", async (req: Request & { isXHubValid: () => boolean }, res) => {
		if (!req.isXHubValid()) {
			log.error("POST /facebook : Got an invalid X-Hub SHA-1 signature!");
			return res.status(401).send("Invalid SHA-1 signature in X-Hub header!");
		}

		const [ { changes, time } ] = req.body.entry;
		const [ { field } ] = changes;
		if (field !== "feed") {
			// Wasn't an update to my feed
			return res.sendStatus(200);
		}

		const result = await fetch(`${process.env.FB_GRAPH_URL}/${env.fb.user_id}/posts?access_token=${env.fb.access_token}`);
		const body: object = await result.json();

		if (!result.ok) {
			log.error("POST /facebook : Graph response was not ok");
			return res.status(500).send({ message: "Facebook posts response was not ok", error: body });
		}

		const { data } = body as FBPostsResponse;

		// Filter only posts with a 30 seconds or less difference from the Webhook time, get the first one
		// I assume Rome timezone since I'm the only user of this shit
		// If you are using this thing from a different timezone, change the offset here (created_time needs to be changed, time is already offseted by FB)
		const posts = data.filter(({ created_time }) => moment(moment.unix(time)).diff(moment(created_time).local(), "minutes") < 1);
		log.info("Post from Facebook: ", posts[0]);
	});
}
