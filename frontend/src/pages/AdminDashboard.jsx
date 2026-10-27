
import { useEffect, useState } from "react";

import {
  BarChart3,
  Link as LinkIcon,
  MousePointerClick,
  RefreshCw,
  ShieldCheck,
  Users
} from "lucide-react";

import Navbar from "../components/Navbar";

import api from "../services/api";

const AdminDashboard = () => {
  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/admin/dashboard");

      setData(
        response.data.dashboard ||
        response.data
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="app-page">
        <Navbar />

        <div className="loading-box page-loading">
          <div className="spinner"></div>
          <p>
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  const totalUsers =
    Number(
      data?.totalUsers ??
      data?.total_users ??
      0
    );

  const totalUrls =
    Number(
      data?.totalUrls ??
      data?.total_urls ??
      0
    );

  const totalClicks =
    Number(
      data?.totalClicks ??
      data?.total_clicks ??
      0
    );

  return (
    <div className="app-page">

      <Navbar />

      <main className="dashboard-container">

        <div className="page-header">

          <div>
            <p className="eyebrow">
              ADMINISTRATION
            </p>

            <h1>Admin Dashboard</h1>

            <p>
              Monitor the Shortify platform.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={loadDashboard}
          >
            <RefreshCw size={16} />
            Refresh
          </button>

        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div className="admin-banner">
          <div className="admin-banner-icon">
            <ShieldCheck size={25} />
          </div>

          <div>
            <h3>
              Administrator Access
            </h3>

            <p>
              You have access to platform-wide
              statistics and management APIs.
            </p>
          </div>
        </div>

        <div className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon">
              <Users size={21} />
            </div>

            <div>
              <span>Total Users</span>
              <strong>
                {totalUsers}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <LinkIcon size={21} />
            </div>

            <div>
              <span>Total URLs</span>
              <strong>
                {totalUrls}
              </strong>
            </div>
          </div>

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

        </div>

        <section className="analytics-card">

          <div className="section-title-row">
            <div>
              <h2>
                Platform Overview
              </h2>

              <p>
                Overall Shortify usage.
              </p>
            </div>

            <BarChart3 size={22} />
          </div>

          <div className="admin-info-grid">

            <div className="admin-info-card">
              <Users size={22} />
              <span>Registered Users</span>
              <strong>
                {totalUsers}
              </strong>
            </div>

            <div className="admin-info-card">
              <LinkIcon size={22} />
              <span>Short URLs</span>
              <strong>
                {totalUrls}
              </strong>
            </div>

            <div className="admin-info-card">
              <MousePointerClick size={22} />
              <span>Tracked Clicks</span>
              <strong>
                {totalClicks}
              </strong>
            </div>

          </div>

        </section>

      </main>

    </div>
  );
};

export default AdminDashboard;
