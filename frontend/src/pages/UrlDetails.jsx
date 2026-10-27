
import { useEffect, useState } from "react";

import {
  ArrowLeft,
  BarChart3,
  Calendar,
  Globe,
  Link as LinkIcon,
  MousePointerClick,
  Users,
} from "lucide-react";

import { Link, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import AnalyticsChart from "../components/AnalyticsChart";

import urlService from "../services/urlService";
import analyticsService from "../services/analyticsService";

const UrlDetails = () => {
  const { id } = useParams();

  const [url, setUrl] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [clicks, setClicks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          urlResponse,
          analyticsResponse,
          clicksResponse,
        ] = await Promise.all([
          urlService.getUrl(id),
          analyticsService.getSummary(id),
          analyticsService.getClicks(id),
        ]);

        console.log("🔗 URL Response:", urlResponse);
        console.log("📊 Analytics Response:", analyticsResponse);
        console.log("🖱️ Clicks Response:", clicksResponse);

        /*
        |--------------------------------------------------------------------------
        | URL
        |--------------------------------------------------------------------------
        */

        setUrl(
          urlResponse?.data ||
          urlResponse?.url ||
          urlResponse ||
          null
        );

        /*
        |--------------------------------------------------------------------------
        | Analytics
        |--------------------------------------------------------------------------
        |
        | Backend:
        |
        | {
        |   success: true,
        |   data: {
        |     url: {...},
        |     summary: {...},
        |     daily: [...]
        |   }
        | }
        |
        */

        const analyticsData =
          analyticsResponse?.data ||
          analyticsResponse?.analytics ||
          analyticsResponse ||
          {};

        /*
        |--------------------------------------------------------------------------
        | IMPORTANT
        |--------------------------------------------------------------------------
        | Your backend getUrlAnalytics() returns:
        |
        | data: {
        |   url: {...},
        |   summary: {
        |     totalClicks,
        |     uniqueVisitors
        |   },
        |   daily: [...]
        | }
        |
        */

        setAnalytics(analyticsData);

        /*
        |--------------------------------------------------------------------------
        | Clicks
        |--------------------------------------------------------------------------
        |
        | Backend:
        |
        | {
        |   success: true,
        |   data: {
        |     clicks: [...],
        |     pagination: {...}
        |   }
        | }
        |
        | Therefore the array is:
        |
        | clicksResponse.data.clicks
        |
        */

        const clicksData =
          clicksResponse?.data?.clicks ||
          clicksResponse?.clicks ||
          [];

        setClicks(
          Array.isArray(clicksData)
            ? clicksData
            : []
        );
      } catch (err) {
        console.error(
          "❌ Failed to load URL details:",
          err
        );

        console.error(
          "❌ Backend response:",
          err.response?.data
        );

        setError(
          err.response?.data?.message ||
          "Unable to load URL details."
        );

        setClicks([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="app-page">
        <Navbar />

        <div className="loading-box page-loading">
          <div className="spinner"></div>

          <p>
            Loading URL details...
          </p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error || !url) {
    return (
      <div className="app-page">
        <Navbar />

        <main className="dashboard-container">
          <div className="alert alert-error">
            {error || "URL not found."}
          </div>

          <Link
            to="/dashboard"
            className="secondary-button"
          >
            <ArrowLeft size={17} />

            Back to Dashboard
          </Link>
        </main>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | URL Data
  |--------------------------------------------------------------------------
  */

  const shortCode =
    url.short_code ||
    url.shortCode;

  const originalUrl =
    url.original_url ||
    url.originalUrl;

  /*
  |--------------------------------------------------------------------------
  | Analytics Data
  |--------------------------------------------------------------------------
  */

  const totalClicks = Number(
    analytics?.summary?.totalClicks ??
    analytics?.summary?.total_clicks ??
    analytics?.totalClicks ??
    analytics?.total_clicks ??
    url.total_clicks ??
    url.click_count ??
    0
  );

  const uniqueVisitors = Number(
    analytics?.summary?.uniqueVisitors ??
    analytics?.summary?.unique_visitors ??
    analytics?.uniqueVisitors ??
    analytics?.unique_visitors ??
    0
  );

  const daily =
    analytics?.daily ||
    analytics?.dailyClicks ||
    [];

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="app-page">

      <Navbar />

      <main className="dashboard-container">

        {/* Back */}

        <Link
          to="/dashboard"
          className="back-link"
        >
          <ArrowLeft size={17} />

          Back to Dashboard
        </Link>

        {/* Header */}

        <div className="details-header">

          <div>

            <p className="eyebrow">
              URL ANALYTICS
            </p>

            <h1>
              {shortCode}
            </h1>

            <a
              href={urlService.getShortUrl(
                shortCode
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="short-url"
            >
              {urlService.getShortUrl(
                shortCode
              )}
            </a>

          </div>

          <BarChart3 size={32} />

        </div>

        {/* Destination */}

        <div className="original-url-box">

          <LinkIcon size={18} />

          <div>

            <span>
              Destination
            </span>

            <a
              href={originalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {originalUrl}
            </a>

          </div>

        </div>

        {/* Statistics */}

        <div className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon">
              <MousePointerClick size={21} />
            </div>

            <div>

              <span>
                Total Clicks
              </span>

              <strong>
                {totalClicks}
              </strong>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon">
              <Users size={21} />
            </div>

            <div>

              <span>
                Unique Visitors
              </span>

              <strong>
                {uniqueVisitors}
              </strong>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon">
              <Calendar size={21} />
            </div>

            <div>

              <span>
                Created
              </span>

              <strong className="date-value">

                {new Date(
                  url.created_at ||
                  url.createdAt
                ).toLocaleDateString()}

              </strong>

            </div>

          </div>

        </div>

        {/* Click Chart */}

        <section className="analytics-card">

          <div className="section-title-row">

            <div>

              <h2>
                Click activity
              </h2>

              <p>
                Daily click performance.
              </p>

            </div>

            <BarChart3 size={22} />

          </div>

          <AnalyticsChart
            data={daily}
          />

        </section>

        {/* Recent Clicks */}

        <section className="analytics-card">

          <div className="section-title-row">

            <div>

              <h2>
                Recent clicks
              </h2>

              <p>
                Information about recent visitors.
              </p>

            </div>

            <Globe size={22} />

          </div>

          {!Array.isArray(clicks) ||
          clicks.length === 0 ? (

            <div className="empty-state small">

              <p>
                No clicks recorded yet.
              </p>

            </div>

          ) : (

            <div className="click-table-wrapper">

              <table className="click-table">

                <thead>

                  <tr>

                    <th>
                      Date
                    </th>

                    <th>
                      IP Hash
                    </th>

                    <th>
                      Device
                    </th>

                    <th>
                      Browser
                    </th>

                    <th>
                      OS
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {clicks.map(
                    (click, index) => (

                      <tr
                        key={
                          click.id ||
                          index
                        }
                      >

                        <td>

                          {click.clicked_at
                            ? new Date(
                                click.clicked_at
                              ).toLocaleString()
                            : "Unknown"}

                        </td>

                        <td>

                          {click.ip_hash ||
                            "Unknown"}

                        </td>

                        <td>

                          {click.device_type ||
                            "Unknown"}

                        </td>

                        <td>

                          {click.browser ||
                            "Unknown"}

                        </td>

                        <td>

                          {click.operating_system ||
                            "Unknown"}

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
};

export default UrlDetails;
