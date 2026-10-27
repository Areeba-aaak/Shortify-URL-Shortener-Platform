import QRCode from "qrcode";

export const generateQrCodeDataUrl = async (url) => {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 400,
  });
};

export const generateQrCodeBuffer = async (url) => {
  return QRCode.toBuffer(url, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 500,
  });
};