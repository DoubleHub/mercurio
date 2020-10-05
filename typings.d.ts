declare namespace Express {
	export interface Request {
		isXHubValid: () => boolean;
	}
}
