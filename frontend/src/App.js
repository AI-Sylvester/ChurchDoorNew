import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

import Login from './components/LoginForm';
import Home from './components/Home';
import AddFamily from './components/AddFamily';
import AddMember from './components/AddMember';
import PrivateRoute from './PrivateRoute';
import Layout from './components/Layout';
import FamilyList from './components/FamilyList';
import MemberList from './components/MemberList';
import FamilyDetailsView from './components/FamilyDetails';
import AnbiyamManager from './components/AnbiyamManager';
import AnbiyamFamilyView from './components/AnbiyamFamilies'
import FamilyMap from './components/FamilyMap';
import FamilyCard from './components/FamilyCard';
import BirthdayReminders from './components/BirthdayRemainder';
import StatsPage from './components/StatsPage';
import UserManagement from './components/UserManagement';
import ContactBook from './components/ContactBook';
import AdminApprovals from './components/panels/AdminApprovals';
import UpdateRequests from './components/panels/UpdateRequests';
import GroupUpdateRequests from './components/panels/GroupUpdateRequests';
import EventReports from './components/panels/EventReports';
import MyFamily from './components/panels/MyFamily';
import AnbiyamSummary from './components/panels/AnbiyamSummary';
import Payments from './components/panels/Payments';
import RaiseUpdate from './components/panels/RaiseUpdate';
import SubmitReport from './components/panels/SubmitReport';
import VerifyRegistrations from './components/panels/VerifyRegistrations';

import RoleRoute from './RoleRoute';

const BackButtonHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (Capacitor.getPlatform() === 'web') return;

    const backListener = CapApp.addListener('backButton', () => {
      if (location.pathname === '/home' || location.pathname === '/login') {
        CapApp.exitApp();
      } else {
        navigate(-1);
      }
    });

    return () => {
      backListener.then(l => l.remove());
    };
  }, [navigate, location]);

  return null;
};

function App() {
  return (
    <BrowserRouter>
      <BackButtonHandler />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Default route: Redirect to /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected routes - Available to all authenticated users */}
        <Route path="/home" element={<PrivateRoute><Layout><Home /></Layout></PrivateRoute>} />
        <Route path="/add-family" element={<PrivateRoute><Layout><AddFamily /></Layout></PrivateRoute>} />
        <Route path="/add-member" element={<PrivateRoute><Layout><AddMember /></Layout></PrivateRoute>} />
        <Route path="/edit-family/:familyId" element={<PrivateRoute><Layout><AddFamily isEdit={true} /></Layout></PrivateRoute>} />
        <Route path="/familylist" element={<PrivateRoute><Layout><FamilyList /></Layout></PrivateRoute>} />
        <Route path="/familydet/:familyId?" element={<PrivateRoute><Layout><FamilyDetailsView /></Layout></PrivateRoute>} />
        <Route path="/familycard" element={<PrivateRoute><Layout><FamilyCard /></Layout></PrivateRoute>} />
        <Route path="/birthdays" element={<PrivateRoute><Layout><BirthdayReminders /></Layout></PrivateRoute>} />
        <Route path="/contacts" element={<PrivateRoute><Layout><ContactBook /></Layout></PrivateRoute>} />
        <Route path="/my-family" element={<PrivateRoute><Layout><MyFamily /></Layout></PrivateRoute>} />
        <Route path="/raise-update" element={<PrivateRoute><Layout><RaiseUpdate /></Layout></PrivateRoute>} />
        <Route path="/payments" element={<PrivateRoute><Layout><Payments type="subscription" /></Layout></PrivateRoute>} />
        <Route path="/donations" element={<PrivateRoute><Layout><Payments type="donation" /></Layout></PrivateRoute>} />

        {/* Admin and Incharge only routes */}
        <Route path="/anbiyamfam" element={<PrivateRoute><RoleRoute allowedRoles={['admin', 'incharge']}><Layout><AnbiyamFamilyView /></Layout></RoleRoute></PrivateRoute>} />
        <Route path="/memlist" element={<PrivateRoute><RoleRoute allowedRoles={['admin', 'incharge']}><Layout><MemberList /></Layout></RoleRoute></PrivateRoute>} />
        <Route path="/group-updates" element={<PrivateRoute><RoleRoute allowedRoles={['admin', 'incharge']}><Layout><GroupUpdateRequests /></Layout></RoleRoute></PrivateRoute>} />
        <Route path="/submit-report" element={<PrivateRoute><RoleRoute allowedRoles={['admin', 'incharge']}><Layout><SubmitReport /></Layout></RoleRoute></PrivateRoute>} />
        <Route path="/verify-registrations" element={<PrivateRoute><RoleRoute allowedRoles={['admin', 'incharge']}><Layout><VerifyRegistrations /></Layout></RoleRoute></PrivateRoute>} />

        {/* Admin only routes */}
        <Route path="/anbiyam" element={<PrivateRoute><RoleRoute allowedRoles={['admin']}><Layout><AnbiyamManager /></Layout></RoleRoute></PrivateRoute>} />
        <Route path="/familymap" element={<PrivateRoute><RoleRoute allowedRoles={['admin', 'incharge']}><Layout><FamilyMap /></Layout></RoleRoute></PrivateRoute>} />
        <Route path="/stats" element={<PrivateRoute><RoleRoute allowedRoles={['admin']}><Layout><StatsPage /></Layout></RoleRoute></PrivateRoute>} />
        <Route path="/user-management" element={<PrivateRoute><RoleRoute allowedRoles={['admin']}><Layout><UserManagement /></Layout></RoleRoute></PrivateRoute>} />
        <Route path="/approvals" element={<PrivateRoute><RoleRoute allowedRoles={['admin']}><Layout><AdminApprovals /></Layout></RoleRoute></PrivateRoute>} />
        <Route path="/updates" element={<PrivateRoute><RoleRoute allowedRoles={['admin']}><Layout><UpdateRequests /></Layout></RoleRoute></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><RoleRoute allowedRoles={['admin']}><Layout><EventReports /></Layout></RoleRoute></PrivateRoute>} />
        <Route path="/anbiyam-summary" element={<PrivateRoute><RoleRoute allowedRoles={['admin']}><Layout><AnbiyamSummary /></Layout></RoleRoute></PrivateRoute>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
