import React, { Fragment } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import routes from './routes/index';
import DefaultComponent from './components/DefaultComponent/DefaultComponent';
import ProtectedRoute from './components/ProtectedRoute';
import SignUp from './pages/SignUp/SignUp';
import SignUpDetails from './pages/SignUp/SignUp_next';

function App() {
  return (
    <AuthProvider>
      <div>
        <Router>
          <Routes>
            {/* Add signup routes first */}
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signup-details" element={<SignUpDetails />} />
            
            {/* Map through other routes */}
            {routes.map((route) => {
              const Page = route.page;
              const Layout = route.isShowHeader ? DefaultComponent : Fragment;
              
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    route.protected ? (
                      <ProtectedRoute>
                        <Layout>
                          <Page />
                        </Layout>
                      </ProtectedRoute>
                    ) : (
                      <Layout>
                        <Page />
                      </Layout>
                    )
                  }
                />
              );
            })}
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;