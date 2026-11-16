# Admin account setup

There is **no public registration**. Create the admin manually:

1. Supabase Dashboard → **Authentication → Users → Add user**
   — create a user with your admin email + a strong password.
2. Copy that user's UUID.
3. Supabase **SQL Editor**:
   ```sql
   insert into public.admins (user_id, email, role)
   values ('THE_USER_UUID', 'you@example.com', 'super_admin');
   ```
4. Open `https://yourdomain.com/admin/login` and sign in with that email/password.
   `/admin/*` routes additionally check the `admins` table in the app and via
   RLS in the database — being signed in alone is not enough, and hiding the
   `/admin` URL is not relied on as a security measure.
5. In production, disable sign-ups: Supabase → Authentication → Settings →
   uncheck "Allow new users to sign up".
