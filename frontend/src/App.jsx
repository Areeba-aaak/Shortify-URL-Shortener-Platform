
import {
  Navigate,
  Route,
  Routes
} from "react-router-dom";

import { useEffect } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import UrlDetails from "./pages/UrlDetails";
import AdminDashboard from "./pages/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";

import { useAuth } from "./context/AuthContext";

const HomeRedirect = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Navigate
      to={
        isAuthenticated
          ? "/dashboard"
          : "/auth/login"
      }
      replace
    />
  );
};

const NotFound = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="not-found-page">

      <div>
        <h1>404</h1>

        <h2>
          Page not found
        </h2>

        <p>
          The page you are looking for
          doesn't exist.
        </p>

        <a
          href={
            isAuthenticated
              ? "/dashboard"
              : "/auth/login"
          }
          className="primary-button"
        >
          Go Home
        </a>
      </div>

    </div>
  );
};

const App = () => {
  useEffect(() => {
    document.title = "Shortify";
  }, []);

  return (
    <Routes>

      <Route
        path="/"
        element={<HomeRedirect />}
      />

      <Route
        path="/auth/login"
        element={<Login />}
      />

      <Route
        path="/auth/register"
        element={<Register />}
      />

      <Route element={<ProtectedRoute />}>

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/analytics"
          element={<Analytics />}
        />

        <Route
          path="/urls/:id"
          element={<UrlDetails />}
        />

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

      </Route>

      <Route
        path="*"
        element={<NotFound />}
      />

    </Routes>
  );
};

export default App;
