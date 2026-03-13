'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userJson = localStorage.getItem('adminUser');

    if (token && userJson) {
      try {
        setUser(JSON.parse(userJson));
      } catch {
        localStorage.clear();
        router.replace('/login');
      }
    } else {
      router.replace('/login');
    }
    setLoading(false);
  }, [router]);

  const logout = () => {
    localStorage.clear();
    setUser(null);
    router.replace('/login');
  };

  return { user, loading, logout };
}
