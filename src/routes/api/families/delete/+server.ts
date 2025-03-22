import { supabase } from "$lib/supabase.js";
import { json } from "@sveltejs/kit";

export async function POST({ request, locals }) {
    const formData = await request.formData();
    const id = formData.get('id') as number | null;

    const { data: familyDeleteData, error: familyDeleteError } = await supabase
        .from('plant_family')
        .delete()
        .eq('id', id);
    if(familyDeleteError) {
        return json({ success: false, message: familyDeleteError});
    }

    return json({ success: true, message: 'Family deleted.' });
}