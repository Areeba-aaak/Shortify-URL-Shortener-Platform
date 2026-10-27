
import { useEffect, useState } from "react";

import {
  Link as LinkIcon,
  Link2,
  MousePointerClick,
  Plus,
  RefreshCw,
} from "lucide-react";

import Navbar from "../components/Navbar";
import UrlForm from "../components/UrlForm";
import UrlCard from "../components/UrlCard";

import urlService from "../services/urlService";

const Dashboard = () => {
  const [urls, setUrls] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadUrls = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await urlService.getUrls();

      console.log("GET URLS RESPONSE:", response);

      /*
       * Backend response:
       *
       * {
       *   success: true,
       *   data: {
       *     urls: [...],
       *     pagination: {...}
       *   }
       * }
       *
       * We need only the urls array.
       */

      const urlsData = response?.data?.urls;

      if (Array.isArray(urlsData)) {
        setUrls(urlsData);
      } else if (Array.isArray(response?.urls)) {
        setUrls(response.urls);
      } else if (Array.isArray(response?.data)) {
        setUrls(response.data);
      } else {
        console.warn(
          "Unexpected URL response format:",
          response
        );

        setUrls([]);
      }
    } catch (err) {
      console.error("Unable to load URLs:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load URLs."
      );

      setUrls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUrls();
  }, []);

  const handleCreated = (response) => {
    console.log("CREATE URL RESPONSE:", response);

    /*
     * Backend create response:
     *
     * {
     *   success: true,
     *   message: "...",
     *   data: {
     *     id: "...",
     *     originalUrl: "...",
     *     shortCode: "...",
     *     shortUrl: "..."
     *   }
     * }
     */

    const newUrl = response?.data;

    if (newUrl && typeof newUrl === "object") {
      setUrls((previous) => [
        newUrl,
        ...previous,
      ]);
    } else {
      loadUrls();
    }
  };

  const handleDelete = (id) => {
    setUrls((previous) =>
      previous.filter(
        (url) => url.id !== id
      )
    );
  };

  const totalClicks = urls.reduce(
    (sum, url) =>
      sum +
      Number(
        url.click_count ??
          url.clickCount ??
          url.total_clicks ??
          url.totalClicks ??
          0
      ),
    0
  );

  const activeUrls = urls.filter(
    (url) => url.is_active !== false
  );

  return (
    <div className="app-page">

      <Navbar />

      <main className="dashboard-container">

        {/* Page Header */}
        <div className="page-header">

          <div>
            <p className="eyebrow">
              URL MANAGEMENT
            </p>

            <h1>Dashboard</h1>

            <p>
              Create, manage and track all
              your shortened links.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={loadUrls}
            disabled={loading}
          >
            <RefreshCw size={16} />

            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

        {/* Statistics */}
        <div className="stats-grid">

          {/* Total URLs */}
          <div className="stat-card">

            <div className="stat-icon">
              <LinkIcon size={21} />
            </div>

            <div>
              <span>Total URLs</span>

              <strong>
                {urls.length}
              </strong>
            </div>

          </div>

          {/* Total Clicks */}
          <div className="stat-card">

            <div className="stat-icon">
              <MousePointerClick size={21} />
            </div>

            <div>
              <span>Total Clicks</span>

              <strong>
                {totalClicks}
              </strong>
            </div>

          </div>

          {/* Active Links */}
          <div className="stat-card">

            <div className="stat-icon">
              <Link2 size={21} />
            </div>

            <div>
              <span>Active Links</span>

              <strong>
                {activeUrls.length}
              </strong>
            </div>

          </div>

        </div>

        {/* Create URL */}
        <UrlForm
          onCreated={handleCreated}
        />

        {/* URL List */}
        <section className="urls-section">

          <div className="section-title-row">

            <div>
              <h2>Your URLs</h2>

              <p>
                Manage your shortened links.
              </p>
            </div>

            <span className="count-badge">
              {urls.length}
            </span>

          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="loading-box">

              <div className="spinner"></div>

              <p>
                Loading URLs...
              </p>

            </div>

          ) : urls.length === 0 ? (

            /* Empty State */
            <div className="empty-state">

              <div className="empty-icon">
                <Plus size={28} />
              </div>

              <h3>
                No shortened URLs yet
              </h3>

              <p>
                Create your first short URL
                using the form above.
              </p>

            </div>

          ) : (

            /* URLs */
            <div className="url-list">

              {urls.map((url) => (
                <UrlCard
                  key={url.id}
                  url={url}
                  onDelete={handleDelete}
                />
              ))}

            </div>
          )}

        </section>

      </main>

    </div>
  );
};

export default Dashboard;
