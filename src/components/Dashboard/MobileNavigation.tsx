import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Heart, BookOpen, Smile, Bot, MessageCircle, LogOut, User, Menu } from 'lucide-react';

interface MobileNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ activeSection, onSectionChange }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Heart },
    { id: 'gratitude', label: 'Gratitude Journal', icon: BookOpen },
    { id: 'mood', label: 'Mood Tracker', icon: Smile },
    { id: 'heartbot', label: 'HeartBot', icon: Bot },
    { id: 'affirmations', label: 'Affirmations', icon: MessageCircle },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
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
                <SheetTrigger key={item.id} asChild>
                  <button
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
                </SheetTrigger>
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
      </SheetContent>
    </Sheet>
  );
};