import React, { useState } from 'react';
import { LoginForm } from '@/components/Auth/LoginForm';
import { SignupForm } from '@/components/Auth/SignupForm';
import { Heart } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-8 fade-in">
          <div className="flex justify-center">
            <div className="p-6 rounded-full bg-gradient-primary shadow-glow">
              <Heart className="w-16 h-16 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-5xl font-bold text-glow mb-4">HeartSpace</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Your sanctuary for emotional wellbeing, gratitude, and genuine connection
            </p>
          </div>
        </div>

        {/* Auth Forms */}
        <div className="slide-up">
          {isLogin ? (
            <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
          ) : (
            <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Made with 💖 for your emotional journey</p>
        </div>
      </div>
    </div>
  );
};