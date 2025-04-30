import { supabase } from '$lib/supabase';
import { json, type RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';

const loginSchema = z.object({
    email:    z.string().email({ message: 'Neplatný formát emailu' }),
    password: z
        .string()
        .min(6, { message: 'Heslo musí byť aspoň 6 znakov' })
        .max(20, { message: 'Heslo musí byť kratšie ako 20 znakov' })
})

export const POST: RequestHandler = async ({ request, cookies, locals }) => {
  const formData = await request.formData();
  const email = String(formData.get('email')   ?? '');
  const password = String(formData.get('password')?? '');

  const validationResult = loginSchema.safeParse({ email, password });
  if (!validationResult.success) {
    return json({ success: false, error: validationResult.error.errors.map((err) => err.message).join(', ') });
  }

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