
import { useState } from "react";

import {
  Link,
  Navigate,
  useNavigate
} from "react-router-dom";

import {
  Link as LinkIcon,
  Loader2
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const Register = () => {
  const {
    register,
    isAuthenticated
  } = useAuth();

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      await register(
        name,
        email,
        password
      );

      // Registration creates the account.
      // Backend does not issue an access token here.
      // Therefore send the user to Login.

      navigate("/auth/login", {
        replace: true
      });

    } catch (err) {
      console.error(
        "========== REGISTRATION ERROR =========="
      );

      console.error(
        "Message:",
        err.message
      );

      console.error(
        "Status:",
        err.response?.status
      );

      console.error(
        "Response:",
        err.response?.data
      );

      console.error(
        "========================================"
      );

      const responseData =
        err.response?.data;

      // Backend validation errors
      if (
        responseData?.errors &&
        Array.isArray(responseData.errors)
      ) {
        setError(
          responseData.errors
            .map(
              (item) =>
                item.msg ||
                item.message ||
                "Invalid input"
            )
            .join(", ")
        );
      }

      // Backend normal message
      else if (responseData?.message) {
        setError(
          responseData.message
        );
      }

      // Network error
      else if (
        err.request &&
        !err.response
      ) {
        setError(
          "Cannot connect to the backend. Please make sure the server is running on port 5000."
        );
      }

      // Unknown error
      else {
        setError(
          err.message ||
          "Unable to create account."
        );
      }

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

          <h1>Create account</h1>

          <p>
            Start creating and tracking short URLs.
          </p>

        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="input-group">

            <label>
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
            />

          </div>

          <div className="input-group">

            <label>
              Email Address
            </label>

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

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

          </div>

          <div className="input-group">

            <label>
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
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

                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>

        </form>

        <p className="auth-footer">

          Already have an account?{" "}

          <Link to="/auth/login">
            Login
          </Link>

        </p>

      </div>

    </div>
  );
};

export default Register;
