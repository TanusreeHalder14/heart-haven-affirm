import React, { useState } from 'react';
import { Navigation } from '@/components/Dashboard/Navigation';
import { MobileNavigation } from '@/components/Dashboard/MobileNavigation';
import { DashboardHome } from '@/components/Dashboard/DashboardHome';
import { GratitudeJournal } from '@/components/Gratitude/GratitudeJournal';
import { MoodTracker } from '@/components/Mood/MoodTracker';
import { HeartBotChat } from '@/components/HeartBot/HeartBotChat';
import { CommunityAffirmations } from '@/components/Affirmations/CommunityAffirmations';
import { Heart } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'dashboard': return 'Dashboard';
      case 'gratitude': return 'Gratitude Journal';
      case 'mood': return 'Mood Tracker';
      case 'heartbot': return 'HeartBot';
      case 'affirmations': return 'Community Affirmations';
      default: return 'Dashboard';
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardHome onSectionChange={setActiveSection} />;
      case 'gratitude':
        return <GratitudeJournal />;
      case 'mood':
        return <MoodTracker />;
      case 'heartbot':
        return <HeartBotChat />;
      case 'affirmations':
        return <CommunityAffirmations />;
      default:
        return <DashboardHome onSectionChange={setActiveSection} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center space-x-3">
            <Heart className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-semibold">{getSectionTitle()}</h1>
          </div>
          <MobileNavigation 
            activeSection={activeSection} 
            onSectionChange={setActiveSection} 
          />
        </header>

        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};