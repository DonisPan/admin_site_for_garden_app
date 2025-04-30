import { supabase } from "$lib/supabase.js";
import { json } from "@sveltejs/kit";

export async function POST({ request, locals }) {
    const formData = await request.formData();
    const id = formData.get('id') as number | null;

    const { data: plantDeleteData, error: plantDeleteError } = await supabase
        .from('ga_plant')
        .delete()
        .eq('id', id);
    if(plantDeleteError) {
        return json({ success: false, error: plantDeleteError});
    }

    return json({ success: true, error: 'Plant deleted.' });
}