import express from "express";
import body_parser from "body-parser";
import xhub from "express-x-hub";
import { env } from "@env";

export function setup_server(): express.Application {
	const app = express();
	app.set("host", env.host);
	app.set("port", env.port);

	app.use(xhub({ algorithm: "sha1", secret: env.fb.app_secret }));
	app.use(body_parser.json());

	return app;
}
