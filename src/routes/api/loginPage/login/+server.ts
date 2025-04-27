import { supabase } from '$lib/supabase';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, cookies, locals }) => {
  const formData = await request.formData();
  const email = String(formData.get('email')   ?? '');
  const password = String(formData.get('password')?? '');

  // sign in
  const { data: loginData, error: loginError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (loginError) {
    return json({ success: false, error: loginError.message }, { status: 400 });
  }

  const session = loginData.session;
  const user = session?.user;
  if (!session || !user) {
    return json({ success: false, error: 'Nepodarilo sa prihlásiť' }, { status: 500 });
  }

  // fetch role from ga_users
  const { data: gaUser, error: gaError } = await supabase
    .from('ga_users')
    .select('is_admin')
    .eq('auth_id', user.id)
    .single();

  if (gaError) {
    return json({ success: false, error: 'Nepodarilo sa získať rolu používateľa' }, { status: 500 });
  }

  if (!gaUser?.is_admin) {
    return json({ success: false, error: 'Nedostatok práv' }, { status: 403 });
  }

  // set cookie
  cookies.set('sb-access-token',  session.access_token,  {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60,
    path: '/'
  });

  locals.is_authorized = true;
  return json({ success: true });
};