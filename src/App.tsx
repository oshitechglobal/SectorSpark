import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { AuthForm } from './components/Auth/AuthForm';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { ContentCenter } from './pages/ContentCenter';
import { Project1460 } from './pages/Project1460';
import { YouTubeSystems } from './pages/YouTubeSystems';
import { LinkedInSystems } from './pages/LinkedInSystems';
import { VideoRevenue } from './pages/VideoRevenue';
import { Goals } from './pages/Goals';
import { Settings } from './pages/Settings';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Infinitum...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="content" element={<ContentCenter />} />
          <Route path="project-1460" element={<Project1460 />} />
          <Route path="youtube-systems" element={<YouTubeSystems />} />
          <Route path="linkedin-systems" element={<LinkedInSystems />} />
          <Route path="video-revenue" element={<VideoRevenue />} />
          <Route path="goals" element={<Goals />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;