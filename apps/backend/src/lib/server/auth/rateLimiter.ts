import { error } from '@sveltejs/kit';

interface LogEntry {
	timestamp: number;
}

export class RateLimiter {
	private store = new Map<string, LogEntry[]>();
	private cleanupInterval: NodeJS.Timeout;

	constructor(
		private maxAttempts: number,
		private windowMs: number
	) {
		this.cleanupInterval = setInterval(() => this.cleanUp, windowMs);
	}

	check(identifier: string) {
		const now = Date.now();
		const windowStart = now - this.windowMs;
		let logs = this.store.get(identifier) || [];
		logs = logs.filter((log) => log.timestamp > windowStart);

		if (logs.length >= this.maxAttempts) {
			error(429, { message: 'Too Many Requests' });
		}
		logs.push({ timestamp: now });
		this.store.set(identifier, logs);
	}

	private cleanUp() {
		const windowStart = Date.now() - this.windowMs;

		for (const [key, logs] of this.store.entries()) {
			const filtered = logs.filter((log) => log.timestamp > windowStart);
			if (!filtered.length) {
				this.store.delete(key);
			} else {
				this.store.set(key, filtered);
			}
		}
	}

	destroy() {
		clearInterval(this.cleanupInterval);
	}
}
