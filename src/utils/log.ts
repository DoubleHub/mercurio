import { createLogger, format, transports } from "winston";

const { combine, colorize, timestamp, splat, printf } = format;
const colorizer = colorize({ colors: { info: 'blue' } });

export const log = createLogger({
	transports: [
		new transports.Console({
			level: {
				development: "debug",
				test: "error",
				production: "error"
			}[process.env.NODE_ENV],
			format: combine(
				timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
				splat(),
				printf(({ timestamp, level, message, ...args }) =>
					colorizer.colorize(level, `[${timestamp}] ${level.toUpperCase()}: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ""}`)
				)
			)
		})
	]
});
