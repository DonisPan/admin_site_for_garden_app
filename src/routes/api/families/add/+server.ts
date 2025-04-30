import { supabase } from "$lib/supabase";
import { json } from "@sveltejs/kit";

export async function POST({ request, locals }) {
    const formData = await request.formData();
    const nameCommon = formData.get('name_common') as string;
    const nameScientific = formData.get('name_scientific') as string;

    const { data: familyInsertData, error: familyInsertError } = await supabase
        .from('plant_family')
        .insert({
            name_common: nameCommon,
            name_scientific: nameScientific,
        })
        .select('id')
        .single();
    if(familyInsertError) {
        return json({ success: false, error: familyInsertError});
    }

    return json({ success: true, error: 'Family added.', id: familyInsertData.id});
}