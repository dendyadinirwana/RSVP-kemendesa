import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { DashboardList } from './pages/DashboardList';
import { DashboardDetail } from './pages/DashboardDetail';
import { GuestManagement } from './pages/GuestManagement';
import { CheckIn } from './pages/CheckIn';
import { PublicRSVP } from './pages/PublicRSVP';
import { RSVPSuccess } from './pages/RSVPSuccess';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<DashboardList />} />
        <Route path="/dashboard/:eventId" element={<DashboardDetail />} />
        <Route path="/dashboard/:eventId/guests" element={<GuestManagement />} />
        <Route path="/checkin/:eventId" element={<CheckIn />} />
        <Route path="/rsvp/:eventId" element={<PublicRSVP />} />
        <Route path="/rsvp/:eventId/success" element={<RSVPSuccess />} />
      </Routes>
    </Router>
  );
}

export default App;
