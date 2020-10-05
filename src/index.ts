import "module-alias/register";

import "./env";
import { setup_server } from "./server";

const app = setup_server();

// Default route
app.get("/", (req, res) => {
	res.status(200).send({ message: "Come ti chiami?" })
});

// Start server
app.listen(app.get("port"), () => {
	console.log(`Mercurio is listening on ${app.get("host")}:${app.get("port")}`)
});
