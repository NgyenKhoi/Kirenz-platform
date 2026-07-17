/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import ProfileSettings from './ProfileSettings';
import UserProfile from './UserProfile';
import HomeFeed from './HomeFeed';
import Explore from './Explore';
import Chat from './Chat';
import EditCover from './EditCover';
import BlockedUsers from './BlockedUsers';
import VisitorFeed from './VisitorFeed';
import ProtectedRoute from './components/ProtectedRoute';
import { initTheme } from './utils/theme';

export default function App() {
  useEffect(() => {
    initTheme();
  }, []);

  return (
    <BrowserRouter>
      <div className="fixed top-0 left-0 right-0 bg-surface-container border-b border-outline-variant p-2 flex justify-center gap-4 z-[100] text-sm hidden">
        <Link to="/login" className="text-primary font-bold hover:underline">Login</Link>
        <span className="text-on-surface-variant">|</span>
        <Link to="/register" className="text-primary font-bold hover:underline">Register</Link>
        <span className="text-on-surface-variant">|</span>
        <Link to="/home" className="text-primary font-bold hover:underline">Home Feed</Link>
        <span className="text-on-surface-variant">|</span>
        <Link to="/explore" className="text-primary font-bold hover:underline">Explore</Link>
        <span className="text-on-surface-variant">|</span>
        <Link to="/profile" className="text-primary font-bold hover:underline">Profile</Link>
        <span className="text-on-surface-variant">|</span>
        <Link to="/chat" className="text-primary font-bold hover:underline">Chat</Link>
        <span className="text-on-surface-variant">|</span>
        <Link to="/settings" className="text-primary font-bold hover:underline">Settings</Link>
        <span className="text-on-surface-variant">|</span>
        <Link to="/blocked" className="text-primary font-bold hover:underline">Blocked</Link>
      </div>
      <div>
        <Routes>
          <Route path="/" element={<VisitorFeed />} />
          <Route path="/posts/:postId" element={<VisitorFeed />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<ProtectedRoute><HomeFeed /></ProtectedRoute>} />
          <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/edit-cover" element={<ProtectedRoute><EditCover /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/friends" element={<Navigate to="/profile?tab=friends" replace />} />
          <Route path="/stories" element={<Navigate to="/home" replace />} />
          <Route path="/story/:id" element={<Navigate to="/home" replace />} />
          <Route path="/settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
          <Route path="/privacy" element={<Navigate to="/settings" replace />} />
          <Route path="/blocked" element={<ProtectedRoute><BlockedUsers /></ProtectedRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}


