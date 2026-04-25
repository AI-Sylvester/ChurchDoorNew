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

        {/* Protected routes */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Layout>
                <Home />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/add-family"
          element={
            <PrivateRoute>
              <Layout>
                <AddFamily />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/add-member"
          element={
            <PrivateRoute>
              <Layout>
                <AddMember />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/familylist"
          element={
            <PrivateRoute>
              <Layout>
                <FamilyList />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/anbiyam"
          element={
            <PrivateRoute>
              <Layout>
                <AnbiyamManager />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/anbiyamfam"
          element={
            <PrivateRoute>
              <Layout>
                <AnbiyamFamilyView />
              </Layout>
            </PrivateRoute>
          }
        />
          <Route
          path="/familymap"
          element={
            <PrivateRoute>
              <Layout>
                <FamilyMap />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/memlist"
          element={
            <PrivateRoute>
              <Layout>
                <MemberList />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/familydet"
          element={
            <PrivateRoute>
              <Layout>
                <FamilyDetailsView />
              </Layout>
            </PrivateRoute>
          }
        />
         <Route
          path="/familycard"
          element={
            <PrivateRoute>
              <Layout>
                <FamilyCard />
              </Layout>
            </PrivateRoute>
          }
        />
          <Route
          path="/birthdays"
          element={
            <PrivateRoute>
              <Layout>
                <BirthdayReminders />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <PrivateRoute>
              <Layout>
                <StatsPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/user-management"
          element={
            <PrivateRoute>
              <Layout>
                <UserManagement />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/contacts"
          element={
            <PrivateRoute>
              <Layout>
                <ContactBook />
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
