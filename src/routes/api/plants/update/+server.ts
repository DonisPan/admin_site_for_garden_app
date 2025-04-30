import { supabase } from "$lib/supabase.js";
import { json } from "@sveltejs/kit";
import { z } from "zod";

const plantSchema = z.object({
    name: z
      .string()
      .min(1,   { message: 'Názov nesmie byť prázdny' })
      .max(50,  { message: 'Názov môže mať max 50 znakov' }),
    note: z
      .string()
      .min(1,   { message: 'Poznámka nesmie byť prázdna' })
      .max(100, { message: 'Poznámka môže mať max 100 znakov' })
  });

export async function POST({ request, locals }) {
    const formData = await request.formData();
    const id = formData.get('id') as number | null;
    const name = formData.get('name') as string;
    const note = formData.get('note' as string);
    const plantClass = formData.get('plantClass') as number | null;
    const plantFamily = formData.get('plantFamily') as number | null;

    const validationResult = plantSchema.safeParse({name, note});
        if (!validationResult.success) {
            return json({ success: false, error: validationResult.error.errors.map((err) => err.message).join(', ')});
        }

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
        return json({ success: false, error: plantUpdateError });
    }

    return json({ success: true, error: 'Plant updated.' });
}