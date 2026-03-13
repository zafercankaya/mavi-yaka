import api from './client';

export async function getMyReferralCode(): Promise<string> {
  const { data } = await api.get('/referrals/my-code');
  return data.data.code;
}

export async function applyReferralCode(code: string): Promise<{ trialEnd: string; message: string }> {
  const { data } = await api.post('/referrals/apply', { code });
  return data.data;
}
