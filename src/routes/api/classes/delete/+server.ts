import { supabase } from "$lib/supabase.js";
import { json } from "@sveltejs/kit";

export async function POST({ request, locals }) {
    const formData = await request.formData();
    const id = formData.get('id') as number | null;

    const { data: classDeleteData, error: classDeleteError } = await supabase
        .from('plant_class')
        .delete()
        .eq('id', id);
    if(classDeleteError) {
        return json({ success: false, error: classDeleteError});
    }

    return json({ success: true, error: 'Class deleted.' });
}