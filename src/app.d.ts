// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
    		is_authorized: boolean;
		}
		interface PageData {
			supabase: SupabaseClient
			 session: Session | null
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
