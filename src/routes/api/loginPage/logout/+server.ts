import { supabase } from "$lib/supabase";
import { json } from "@sveltejs/kit";

export async function POST({ locals, cookies }) {

    await supabase.auth.signOut();

    cookies.delete('sb-access-token', { path: '/' });

    return json({success: true, message: 'Používateľ sa odhlásil' });
}