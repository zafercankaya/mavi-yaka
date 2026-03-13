import api from './client';

interface LoginResponse {
  data: {
    user: { id: string; email: string; displayName: string | null; role: string };
    accessToken: string;
    refreshToken: string;
  };
}

export async function loginApi(email: string, password: string): Promise<LoginResponse['data']> {
  const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
  return data.data;
}

export async function registerApi(
  email: string,
  password: string,
  displayName?: string,
): Promise<LoginResponse['data']> {
  const { data } = await api.post<LoginResponse>('/auth/register', {
    email,
    password,
    displayName,
  });
  return data.data;
}

export async function deleteAccountApi(): Promise<{ message: string }> {
  const { data } = await api.delete<{ data: { message: string } }>('/auth/account');
  return data.data;
}

export async function socialLoginApi(
  provider: 'GOOGLE' | 'APPLE',
  idToken: string,
  displayName?: string,
): Promise<LoginResponse['data']> {
  const { data } = await api.post<LoginResponse>('/auth/social-login', {
    provider,
    idToken,
    ...(displayName ? { displayName } : {}),
  });
  return data.data;
}
