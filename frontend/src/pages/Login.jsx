
import { useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate
} from "react-router-dom";

import { Link as LinkIcon, Loader2 } from "lucide-react";

import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login, isAuthenticated } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] =
    useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    try {
      setLoading(true);

      await login(email, password);

      const destination =
        location.state?.from?.pathname ||
        "/dashboard";

      navigate(destination, {
        replace: true
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          <div className="brand-icon">
            <LinkIcon size={23} />
          </div>
          <span>Shortify</span>
        </div>

        <div className="auth-heading">
          <h1>Welcome back</h1>
          <p>
            Sign in to manage your short URLs.
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <label>Email Address</label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          <button
            type="submit"
            className="primary-button full-width"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="spin"
                />
                Signing in...
              </>
            ) : (
              "Login"
            )}
          </button>

        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/auth/register">
            Create one
          </Link>
        </p>

      </div>

    </div>
  );
};

export default Login;
