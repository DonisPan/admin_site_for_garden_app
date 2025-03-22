import { supabase } from "$lib/supabase.js";
import { json } from "@sveltejs/kit";

export async function POST({ request, locals }) {
    const formData = await request.formData();
    const id = formData.get('id') as number | null;

    const { data: announcerDeleteData, error: announcerDeleteError } = await supabase
        .from('ga_announcers')
        .delete()
        .eq('id', id);
    if(announcerDeleteError) {
        return json({ success: false, message: announcerDeleteError});
    }

    return json({ success: true, message: 'Announcer deleted.' });
}