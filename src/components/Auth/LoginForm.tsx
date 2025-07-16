import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Heart, Mail, Lock, Loader2 } from 'lucide-react';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Please fill all fields",
        description: "Email and password are required",
        variant: "destructive"
      });
      return;
    }

    try {
      await login(email, password);
      toast({
        title: "Welcome back! 💖",
        description: "You've successfully logged into HeartSpace"
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="card-floating w-full max-w-md">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Heart className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-glow mb-2">Welcome Back</h1>
        <p className="text-muted-foreground">Continue your wellness journey</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 rounded-2xl border-border/50 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 rounded-2xl border-border/50 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full btn-healing text-lg py-6"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-muted-foreground">
          New to HeartSpace?{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-primary hover:text-primary-glow font-medium transition-colors"
          >
            Create Account
          </button>
        </p>
      </div>
    </Card>
  );
};