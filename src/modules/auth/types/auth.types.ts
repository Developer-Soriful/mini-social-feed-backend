export interface SignupInput {
  username: string;
  email: string;
  password: string;
  fcmToken?: string;
}

export interface LoginInput {
  email: string;
  password: string;
  fcmToken?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    fcmToken?: string;
  };
}
