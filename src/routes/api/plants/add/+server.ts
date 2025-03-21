import { supabase } from "$lib/supabase.js";
import { json } from "@sveltejs/kit";

export async function POST({ request, locals }) {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const note = formData.get('note' as string);
    const plantClass = formData.get('plantClass') as number | null;
    const plantFamily = formData.get('plantFamily') as number | null;

    const { data: plantInsertData, error: plantInsertError } = await supabase
        .from('ga_plant')
        .insert({
            name: name,
            note: note,
            class: plantClass,
            family: plantFamily,
            is_custom: false,
        })
        .select('id')
        .single();
    if(plantInsertError) {
        return json({ success: false, message: plantInsertError});
    }

    return json({ success: true, message: 'Plant added.', id: plantInsertData.id});
}