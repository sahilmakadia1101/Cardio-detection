import { useState } from 'react';
import Header from './components/Header';
import AssessmentPage from './components/AssessmentPage';
import DashboardPage from './components/DashboardPage';
import AboutPage from './components/AboutPage';
import Footer from './components/Footer';

import './index.css';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('assessment');

  return (
    <div className="app">
      {/* Dynamic Background Light Orbs */}
      <div className="bg-orb bg-orb-1" aria-hidden="true" />
      <div className="bg-orb bg-orb-2" aria-hidden="true" />
      <div className="bg-orb bg-orb-3" aria-hidden="true" />

      {/* Main Top Navigation Header */}
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Active Page View */}
      <main className="main-viewport">
        {activeTab === 'assessment' && <AssessmentPage />}
        {activeTab === 'dashboard' && <DashboardPage />}
        {activeTab === 'about' && <AboutPage />}
      </main>

      {/* Comprehensive Footer */}
      <Footer onTabChange={setActiveTab} />
    </div>
  );
}
