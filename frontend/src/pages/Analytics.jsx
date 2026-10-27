
import { useEffect, useState } from "react";

import {
  BarChart3,
  Link as LinkIcon,
  MousePointerClick,
  Users
} from "lucide-react";

import Navbar from "../components/Navbar";
import AnalyticsChart from "../components/AnalyticsChart";

import analyticsService from "../services/analyticsService";

const Analytics = () => {
  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);

        const response =
          await analyticsService.getDashboardAnalytics();

        setData(
          response.analytics ||
          response.data ||
          response
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load analytics."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="app-page">
        <Navbar />

        <div className="loading-box page-loading">
          <div className="spinner"></div>
          <p>
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  const totalClicks =
    Number(
      data?.totalClicks ??
      data?.total_clicks ??
      0
    );

  const totalUrls =
    Number(
      data?.totalUrls ??
      data?.total_urls ??
      0
    );

  const uniqueVisitors =
    Number(
      data?.uniqueVisitors ??
      data?.unique_visitors ??
      0
    );

  const chartData =
    data?.daily ||
    data?.dailyClicks ||
    data?.chart ||
    [];

  return (
    <div className="app-page">

      <Navbar />

      <main className="dashboard-container">

        <div className="page-header">

          <div>
            <p className="eyebrow">
              PERFORMANCE
            </p>

            <h1>Analytics</h1>

            <p>
              Understand how your shortened
              links are performing.
            </p>
          </div>

        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon">
              <LinkIcon size={21} />
            </div>

            <div>
              <span>Total URLs</span>
              <strong>{totalUrls}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <MousePointerClick size={21} />
            </div>

            <div>
              <span>Total Clicks</span>
              <strong>{totalClicks}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Users size={21} />
            </div>

            <div>
              <span>Unique Visitors</span>
              <strong>
                {uniqueVisitors}
              </strong>
            </div>
          </div>

        </div>

        <section className="analytics-card">

          <div className="section-title-row">

            <div>
              <h2>
                Click activity
              </h2>

              <p>
                Clicks recorded over time.
              </p>
            </div>

            <BarChart3 size={22} />

          </div>

          <AnalyticsChart
            data={chartData}
          />

        </section>

      </main>

    </div>
  );
};

export default Analytics;
