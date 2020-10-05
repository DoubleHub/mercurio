import dotenv_flow from "dotenv-flow";

export interface Environment {
	host: string;
	port: number;
	fb: {
		verify_token: string;
		app_secret: string;
		access_token: string;
		user_id: string;
	};
}

function setup_env(): Environment {
	dotenv_flow.config({ purge_dotenv: true });
	const env = process.env;

	const env_keys = {
		host: "HOST",
		port: "PORT",
		fb: {
			verify_token: "FB_VERIFY_TOKEN",
			app_secret: "FB_APP_SECRET",
			access_token: "FB_ACCESS_TOKEN",
			user_id: "FB_USER_ID"
		}
	};

	const checkFalsyValues = (root: object, key: string) => {
		if (!(env_keys[key] instanceof Object)) {
			if (!env[root[key]]) {
				throw `${env_keys[key]} is required in process.env!`;
			}
			return;
		}
		Object.keys(env_keys[key]).forEach(k => checkFalsyValues(env_keys[key], k));
	};

	try {
		Object.keys(env_keys).forEach(key => checkFalsyValues(env_keys, key));
	} catch (err) {
		console.error("Environment is not valid:", err);
	}

	return {
		host: env[env_keys.host],
		port: parseInt(env[env_keys.port]),
		fb: {
			verify_token: env[env_keys.fb.verify_token],
			app_secret: env[env_keys.fb.app_secret],
			access_token: env[env_keys.fb.access_token],
			user_id: env[env_keys.fb.user_id],
		}
	}
}

export const env = setup_env();
