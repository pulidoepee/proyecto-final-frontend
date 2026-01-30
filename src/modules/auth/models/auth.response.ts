export type AuthResponse = {
  id: string;
  email: string;
  token: string;

  // register lo devuelve
  fullName?: string;
  isActive?: boolean;
  role?: string;

  // login lo devuelve (pero NO lo usaremos)
  password?: string;
};
