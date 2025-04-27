import type { PageServerLoad } from "./$types";
import type { User } from "../models/user.model";
import type { Plant } from "../models/plant.model";
import { supabase } from "$lib/supabase";
import type { PlantClass } from "../models/class.model";
import type { PlantFamily } from "../models/family.model";
import type { Announcer } from "../models/announcer.model";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({locals}): Promise<any> => {
      if (!locals.is_authorized) {
        throw redirect(303, '/login');
      }

    console.log('HOME PAGE LOADING');

    // fetch users
    const { data: usersData, error: usersError } = await supabase
        .from('ga_users')
        .select('id, auth_id, name, surname, created_at')
    if(usersError != null) {
        throw usersError;
    }
    const users: User[] = (usersData as any[]).map(user => ({
        id: user.id,
        auth_id: user.auth_id,
        name: user.name,
        surname: user.surname,
        created_at: user.created_at,
        email: null // for now null
      }));

    // fetch user plants
    const { data: userPlantsData, error: userPlantsError } = await supabase
        .from('ga_user_plants')
        .select('user_id, name, plant_id:ga_plant(*, plant_family(*))')
    if(userPlantsError != null) {
        throw userPlantsError;
    }
    const userPlants: Plant[] = (userPlantsData as any[]).map(plant => ({
        user_id: plant.user_id ? plant.user_id : null, 
        id: plant.plant_id.id,
        name: plant.name === null ? plant.plant_id.name : plant.name,
        note: plant.plant_id.note,
        class: plant.plant_id.class,
        family: plant.plant_id.plant_family ? plant.plant_id.plant_family.id : null,
        is_custom: plant.plant_id.is_custom
    }))

    // fetch plants
    const { data: plantsData, error: plantsError } = await supabase
        .from('ga_plant')
        .select('id, name, note, family:plant_family(*), class:plant_class(*)')
        .eq('is_custom', false)
    if(plantsError != null) {
        throw userPlantsError;
    }
    const plants: Plant[] = (plantsData as any[]).map(plant => ({
        user_id: null, 
        id: plant.id,
        name: plant.name,
        note: plant.note,
        class: plant.class ? plant.class.id : null,
        family: plant.family.id,
        is_custom: false
    }))

    // fetch plant classes
    const { data: classData, error: classError } = await supabase
        .from('plant_class')
        .select('id, name')
    if(classError != null) {
        throw classError;
    }
    const classes: PlantClass[] = classData as PlantClass[];

    // fetch plant families
    const { data: familyData, error: familyError } = await supabase
        .from('plant_family')
        .select('id, name_common, name_scientific')
    if(familyError != null) {
        throw familyError;
    }
    const families: PlantFamily[] = familyData as PlantFamily[];
    
    // fetch announcers
    const { data: announcerData, error: announcerError } = await supabase
        .from('ga_announcers')
        .select('id, message, family')
    if(announcerError) {
      throw announcerError;  
    }
    const announcers: Announcer[] = announcerData as Announcer[];

    return { users, userPlants, plants, classes, families, announcers }
}