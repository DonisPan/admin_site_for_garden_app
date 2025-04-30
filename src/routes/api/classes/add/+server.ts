import { supabase } from "$lib/supabase";
import { json } from "@sveltejs/kit";

export async function POST({ request, locals }) {
    const formData = await request.formData();
    const name = formData.get('name') as string;

    const { data: classInsertData, error: classInsertError } = await supabase
        .from('plant_class')
        .insert({
            name: name,
        })
        .select('id')
        .single();
    if(classInsertError) {
        return json({ success: false, error: classInsertError});
    }

    return json({ success: true, error: 'Class added.', id: classInsertData.id});
}