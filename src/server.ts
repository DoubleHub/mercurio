import express from "express";
import body_parser from "body-parser";
import xhub from "express-x-hub";
import helmet from "helmet";
import { setup_env } from "@env";

import facebook_routes from "./routes/facebook";

export function setup_server(): express.Application {
	const env = setup_env();

	const app = express();
	app.set("host", env.host);
	app.set("port", env.port);

	app.use(xhub({ algorithm: "sha1", secret: env.fb.app_secret }));
	app.use(body_parser.json());
	app.use(helmet());
	app.use((err, req, res, next) => {
		if (err) {
			return res.status(err.statusCode || 500).send({ error: err });
		}
		next();
	});

	facebook_routes(app);

	return app;
}
