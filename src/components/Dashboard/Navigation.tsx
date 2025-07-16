import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Heart, BookOpen, Smile, Bot, MessageCircle, LogOut, User } from 'lucide-react';

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeSection, onSectionChange }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Heart },
    { id: 'gratitude', label: 'Gratitude Journal', icon: BookOpen },
    { id: 'mood', label: 'Mood Tracker', icon: Smile },
    { id: 'heartbot', label: 'HeartBot', icon: Bot },
    { id: 'affirmations', label: 'Affirmations', icon: MessageCircle },
  ];

  return (
    <div className="hidden md:flex bg-card border-r border-border h-screen w-80 flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3 mb-4">
          <Heart className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold text-glow">HeartSpace</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-primary text-white shadow-medium'
                  : 'hover:bg-muted text-foreground hover:shadow-soft'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button
          onClick={logout}
          variant="outline"
          className="w-full flex items-center space-x-2 rounded-2xl border-border/50 hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
};