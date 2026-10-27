import {
  BarChart3,
  Calendar,
  Copy,
  ExternalLink,
  KeyRound,
  QrCode,
  Trash2,
} from "lucide-react";

import { useState } from "react";
import { Link } from "react-router-dom";

import urlService from "../services/urlService";

const UrlCard = ({ url, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [loadingQr, setLoadingQr] = useState(false);

  const shortCode =
    url.short_code || url.shortCode;

  const originalUrl =
    url.original_url || url.originalUrl;

  const shortUrl =
    url.short_url ||
    url.shortUrl ||
    urlService.getShortUrl(shortCode);

  const clickCount =
    url.total_clicks ??
    url.click_count ??
    url.clickCount ??
    0;

  const passwordProtected =
    url.password_protected ??
    url.passwordProtected ??
    !!url.password_hash;

  const expiresAt =
    url.expires_at ||
    url.expiresAt;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      alert("Unable to copy URL.");
    }
  };

  const handleQr = async () => {
    // If QR already exists, simply show/hide it
    if (qrCode) {
      setShowQr((previous) => !previous);
      return;
    }

    try {
      setLoadingQr(true);
      setShowQr(true);

      console.log("🔳 Generating QR for URL ID:", url.id);
      console.log("🔗 Short code:", shortCode);

      // IMPORTANT:
      // Backend expects the DATABASE ID
      const response = await urlService.getQrCode(url.id);

      console.log("📦 QR API response:", response);

      // Backend response:
      // {
      //   success: true,
      //   data: {
      //     shortUrl: "...",
      //     qrCode: "data:image/png;base64,..."
      //   }
      // }

      const generatedQrCode =
        response?.data?.qrCode ||
        response?.qrCode ||
        "";

      if (!generatedQrCode) {
        throw new Error(
          "QR code was not returned by the server."
        );
      }

      setQrCode(generatedQrCode);
    } catch (error) {
      console.error(
        "❌ QR generation error:",
        error
      );

      console.error(
        "❌ Server response:",
        error.response?.data
      );

      setShowQr(false);

      alert(
        error.response?.data?.message ||
          "Unable to generate QR code."
      );
    } finally {
      setLoadingQr(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this URL?"
    );

    if (!confirmed) return;

    try {
      await urlService.deleteUrl(url.id);

      if (onDelete) {
        onDelete(url.id);
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to delete URL."
      );
    }
  };

  return (
    <div className="url-card">
      <div className="url-card-main">

        <div className="url-icon">
          <ExternalLink size={20} />
        </div>

        <div className="url-information">

          <div className="short-url-row">
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="short-url"
            >
              {shortUrl}
            </a>

            {passwordProtected && (
              <span
                className="badge badge-warning"
                title="Password protected"
              >
                <KeyRound size={12} />
                Protected
              </span>
            )}
          </div>

          <p
            className="original-url"
            title={originalUrl}
          >
            {originalUrl}
          </p>

          <div className="url-meta">

            <span>
              <BarChart3 size={14} />
              {clickCount} clicks
            </span>

            {expiresAt && (
              <span>
                <Calendar size={14} />
                Expires{" "}
                {new Date(
                  expiresAt
                ).toLocaleDateString()}
              </span>
            )}

          </div>

        </div>

        <div className="url-actions">

          <button
            className="icon-button"
            onClick={handleCopy}
            title="Copy"
          >
            <Copy size={17} />
          </button>

          <button
            className="icon-button"
            onClick={handleQr}
            title="QR Code"
            disabled={loadingQr}
          >
            <QrCode size={17} />
          </button>

          <Link
            to={`/urls/${url.id}`}
            className="icon-button"
            title="Analytics"
          >
            <BarChart3 size={17} />
          </Link>

          <button
            className="icon-button danger"
            onClick={handleDelete}
            title="Delete"
          >
            <Trash2 size={17} />
          </button>

        </div>

      </div>

      {copied && (
        <div className="copy-message">
          ✓ Short URL copied!
        </div>
      )}

      {showQr && (
        <div className="qr-section">

          {loadingQr ? (
            <div className="qr-loading">
              Generating QR code...
            </div>
          ) : qrCode ? (
            <>
              <img
                src={qrCode}
                alt="QR Code"
                className="qr-image"
              />

              <a
                href={qrCode}
                download={`${shortCode}-qr.png`}
                className="secondary-button"
              >
                Download QR
              </a>
            </>
          ) : (
            <p>
              QR code could not be generated.
            </p>
          )}

        </div>
      )}
    </div>
  );
};

export default UrlCard;