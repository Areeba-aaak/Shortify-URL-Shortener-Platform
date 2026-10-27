export const parseUserAgent = (userAgent = '') => {
  const ua = userAgent.toLowerCase();

  let browser = 'Unknown';

  if (ua.includes('edg/')) {
    browser = 'Edge';
  } else if (ua.includes('chrome/')) {
    browser = 'Chrome';
  } else if (ua.includes('firefox/')) {
    browser = 'Firefox';
  } else if (ua.includes('safari/')) {
    browser = 'Safari';
  } else if (ua.includes('opr/')) {
    browser = 'Opera';
  }

  let operatingSystem = 'Unknown';

  if (ua.includes('windows')) {
    operatingSystem = 'Windows';
  } else if (ua.includes('android')) {
    operatingSystem = 'Android';
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    operatingSystem = 'iOS';
  } else if (ua.includes('mac os')) {
    operatingSystem = 'macOS';
  } else if (ua.includes('linux')) {
    operatingSystem = 'Linux';
  }

  let deviceType = 'Desktop';

  if (
    ua.includes('mobile') ||
    ua.includes('android') ||
    ua.includes('iphone')
  ) {
    deviceType = 'Mobile';
  } else if (ua.includes('ipad') || ua.includes('tablet')) {
    deviceType = 'Tablet';
  }

  return {
    browser,
    operatingSystem,
    deviceType,
  };
};