// server/createUser.ts
import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router: Router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface CreateUserRequestBody {
  full_name: string;
  email: string;
  password: string;
  role_id: string | number;
  center_id: string | null;
}

router.post('/create-user', async (req: Request<{}, {}, CreateUserRequestBody>, res: Response) => {
  console.log("📥 POST /api/create-user", req.body);

  const { full_name, email, password, role_id, center_id } = req.body;

  if (!email || !password || !full_name || !role_id) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    // Step 1 – Create Supabase Auth User
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData?.user) {
      console.error("❌ Supabase Auth Error:", authError);
      return res.status(400).json({ error: authError });
    }

    const userId = authData.user.id;

    // Step 2 – Insert into users table
    const insertPayload = {
      id        : userId,
      full_name : full_name.trim(),
      email     : email.trim().toLowerCase(),
      role_id   : parseInt(String(role_id)),
      center_id : center_id || null
    };

    const { error: insertError } = await supabase.from('users').insert([insertPayload] as any);

    if (insertError) {
      console.error("❌ DB Insert Error:", insertError);
      return res.status(400).json({ error: insertError });
    }

    console.log(`✅ User created with ID ${userId}`);
    
    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("🔥 Uncaught Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

