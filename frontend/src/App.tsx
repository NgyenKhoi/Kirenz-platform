/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './Login';
import ProfileSettings from './ProfileSettings';
import PrivacySettings from './PrivacySettings';
import UserProfile from './UserProfile';
import HomeFeed from './HomeFeed';
import Friends from './Friends';
import Stories from './Stories';
import StoryViewer from './StoryViewer';
import Chat from './Chat';
import EditCover from './EditCover';

export default function App() {
  return (
    <BrowserRouter>
      {/* Temporary navigation banner for easy access between screens during development */}
      <div className="fixed top-0 left-0 right-0 bg-surface-container border-b border-outline-variant p-2 flex justify-center gap-4 z-[100] text-sm hidden">
        <Link to="/" className="text-primary font-bold hover:underline">Login</Link>
        <span className="text-on-surface-variant">|</span>
        <Link to="/home" className="text-primary font-bold hover:underline">Home Feed</Link>
        <span className="text-on-surface-variant">|</span>
        <Link to="/stories" className="text-primary font-bold hover:underline">Stories</Link>
        <span className="text-on-surface-variant">|</span>
        <Link to="/profile" className="text-primary font-bold hover:underline">Profile</Link>
        <span className="text-on-surface-variant">|</span>
        <Link to="/chat" className="text-primary font-bold hover:underline">Chat</Link>
        <span className="text-on-surface-variant">|</span>
        <Link to="/friends" className="text-primary font-bold hover:underline">Friends</Link>
        <span className="text-on-surface-variant">|</span>
        <Link to="/settings" className="text-primary font-bold hover:underline">Settings</Link>
        <span className="text-on-surface-variant">|</span>
        <Link to="/privacy" className="text-primary font-bold hover:underline">Privacy</Link>
      </div>
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<HomeFeed />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/story/:id" element={<StoryViewer />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/edit-cover" element={<EditCover />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/settings" element={<ProfileSettings />} />
          <Route path="/privacy" element={<PrivacySettings />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

