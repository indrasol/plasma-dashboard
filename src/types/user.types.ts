export type UserRole = 'admin' | 'marketing' | 'super_admin';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  center_id: string | null;
  role_id: number;
  role: UserRole;
}

export interface AuthUser extends User {
  roles?: {
    name: string;
  };
}

