
import { useState } from "react";
import {
  Calendar,
  KeyRound,
  Link as LinkIcon,
  Loader2,
  Sparkles
} from "lucide-react";

import urlService from "../services/urlService";

const UrlForm = ({ onCreated }) => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [password, setPassword] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!originalUrl.trim()) {
      setError("Please enter a URL.");
      return;
    }

    try {
      setLoading(true);

      const data = {
        originalUrl: originalUrl.trim()
      };

      if (customAlias.trim()) {
        data.customAlias = customAlias.trim();
      }

      if (password.trim()) {
        data.password = password;
      }

      if (expiresAt) {
        data.expiresAt = new Date(
          expiresAt
        ).toISOString();
      }

      const response =
        await urlService.createUrl(data);

      setOriginalUrl("");
      setCustomAlias("");
      setPassword("");
      setExpiresAt("");
      setShowAdvanced(false);

      if (onCreated) {
        onCreated(response);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create short URL."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="url-form-card">
      <div className="section-heading">
        <div>
          <h2>Create a short URL</h2>
          <p>
            Turn your long URL into a simple,
            shareable link.
          </p>
        </div>

        <div className="heading-icon">
          <Sparkles size={22} />
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Original URL</label>

          <div className="input-wrapper">
            <LinkIcon size={19} />

            <input
              type="url"
              placeholder="https://example.com/very-long-url"
              value={originalUrl}
              onChange={(e) =>
                setOriginalUrl(e.target.value)
              }
              required
            />
          </div>
        </div>

        <button
          type="button"
          className="advanced-button"
          onClick={() =>
            setShowAdvanced(!showAdvanced)
          }
        >
          {showAdvanced
            ? "Hide advanced options"
            : "Show advanced options"}
        </button>

        {showAdvanced && (
          <div className="advanced-options">

            <div className="input-group">
              <label>
                Custom Alias{" "}
                <span>(optional)</span>
              </label>

              <div className="input-wrapper">
                <span className="prefix">
                  / 
                </span>

                <input
                  type="text"
                  placeholder="my-link"
                  value={customAlias}
                  onChange={(e) =>
                    setCustomAlias(
                      e.target.value
                    )
                  }
                  maxLength={50}
                />
              </div>

              <small>
                Use letters, numbers, hyphens and
                underscores.
              </small>
            </div>

            <div className="form-row">

              <div className="input-group">
                <label>
                  <KeyRound size={15} />
                  Password
                  <span>(optional)</span>
                </label>

                <input
                  type="password"
                  placeholder="Protect this link"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />
              </div>

              <div className="input-group">
                <label>
                  <Calendar size={15} />
                  Expiration
                  <span>(optional)</span>
                </label>

                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) =>
                    setExpiresAt(e.target.value)
                  }
                />
              </div>

            </div>
          </div>
        )}

        <button
          type="submit"
          className="primary-button"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2
                size={18}
                className="spin"
              />
              Creating...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Shorten URL
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default UrlForm;
