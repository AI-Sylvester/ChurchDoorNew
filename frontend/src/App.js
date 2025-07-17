import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

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

function App() {
  return (
    <BrowserRouter>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
