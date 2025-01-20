'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const AuthForm = () => {
  const [credentials, setCredentials] = useState({ userPhoneOrEmail: '', userPassword: '' });
  const { signIn, isLoading, error } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signIn(credentials);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="userPhoneOrEmail"
        placeholder="Numéro de téléphone ou email"
        value={credentials.userPhoneOrEmail}
        onChange={handleChange}
        required
      />
      <Input
        name="userPassword"
        type="password"
        placeholder="Mot de Passe"
        value={credentials.userPassword}
        onChange={handleChange}
        required
      />
      <Button type="submit" disabled={isLoading} className="w-full bg-[#22A4D5] hover:bg-[#213B4C] transition-colors">
        {isLoading ? 'Connexion en cours...' : 'Se connecter'}
      </Button>
      {error && <p className="text-red-500">{error}</p>}
    </form>

    
  );
};

