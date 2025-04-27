import { supabase } from "$lib/supabase";
import type { Handle } from "@sveltejs/kit";
import cookie from 'cookie';

export const handle: Handle = async ({ event, resolve }) => {
    const cookies = cookie.parse(event.request.headers.get('cookie') || '');
    const accessToken = cookies['sb-access-token'];

    event.locals.is_authorized = false;

    if (accessToken) {
        const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
        if (userError) {
            console.error(userError.message);
        }

        if (userData.user != null) {
            const { data: gaUser, error: gaError } = await supabase
                .from('ga_users')
                .select('is_admin')
                .eq('auth_id', userData.user.id)
                .single();
            event.locals.is_authorized = gaUser?.is_admin;
        }
    } else {
        console.log('No access token found.');
    }

    return resolve(event);
};