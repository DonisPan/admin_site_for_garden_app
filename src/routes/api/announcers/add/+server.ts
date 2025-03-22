import { supabase } from "$lib/supabase";
import { json } from "@sveltejs/kit";

export async function POST({ request, locals }) {
    const formData = await request.formData();
    const family = formData.get('family') as number | null;
    const message = formData.get('message') as string;
    
    const { data: announcerInsertData, error: announcerInsertError } = await supabase
    .from('ga_announcers')
    .insert({
        family: family,
        message: message,
    })
    .select('id')
    .single();
    if(announcerInsertError) {
        return json({ success: false, message: announcerInsertError});
    }

    return json({ success: true, message: 'Announcer added.', id: announcerInsertData.id});
}