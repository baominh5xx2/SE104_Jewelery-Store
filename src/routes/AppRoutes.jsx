import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import routes from './index';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {routes.map((route, index) => {
        const Component = route.page;
        return (
          <Route
            key={index}
            path={route.path}
            element={
              route.protected ? (
                <ProtectedRoute>
                  <Component />
                </ProtectedRoute>
              ) : (
                <Component />
              )
            }
          />
        );
      })}
    </Routes>
  );
};

export default AppRoutes;
