import { supabase } from "$lib/supabase.js";
import { json } from "@sveltejs/kit";

export async function POST({ request, locals }) {
    const formData = await request.formData();
    const id = formData.get('id') as number | null;
    const name = formData.get('name') as string;
    const note = formData.get('note' as string);
    const plantClass = formData.get('plantClass') as number | null;
    const plantFamily = formData.get('plantFamily') as number | null;

    const { data: plantUpdateData, error: plantUpdateError } = await supabase
        .from('ga_plant')
        .update({
            name: name,
            note: note,
            class: plantClass,
            family: plantFamily,
        })
        .eq('id', id);
    if(plantUpdateError) {
        return json({ success: false, message: plantUpdateError });
    }

    return json({ success: true, message: 'Plant updated.' });
}