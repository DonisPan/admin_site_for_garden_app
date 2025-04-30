import { supabase } from "$lib/supabase.js";
import { json } from "@sveltejs/kit";

export async function POST({ request, locals }) {
    const formData = await request.formData();
    const id = formData.get('id') as number | null;

    const { data: userDeleteData, error: userDeleteError } = await supabase
        .from('ga_users')
        .delete()
        .eq('id', id);
    if(userDeleteError) {
        return json({ success: false, error: userDeleteError});
    }

    return json({ success: true, error: 'User deleted.' });
}