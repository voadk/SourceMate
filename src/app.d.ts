declare global {
	namespace App {
		interface Error {
			code?: string;
			id?: string;
		}
		interface Locals {
			supabase: SupabaseClient;
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
			session: Session | null;
			user: User | null;
		}
	}
}

export {};
