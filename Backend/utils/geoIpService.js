/**
 * IP Geolocation and Device/Browser Tracking Service for Inisio User Logins
 */

/**
 * Extract real client IP from incoming Express request
 */
export const extractClientIp = (req) => {
  if (!req) return '127.0.0.1';
  let ip =
    req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.headers['cf-connecting-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    '127.0.0.1';

  if (typeof ip === 'string' && ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }

  // Normalize IPv6 loopback and mapped IPv4
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    return '127.0.0.1';
  }
  if (typeof ip === 'string' && ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  return ip || '127.0.0.1';
};

/**
 * Parse device type, OS, and browser from User-Agent string
 */
export const parseUserAgent = (uaString = '') => {
  const ua = (uaString || '').toLowerCase();
  let deviceType = 'Desktop';

  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)) {
    deviceType = 'Mobile';
  } else if (/ipad|tablet|android(?!.*mobile)/i.test(ua)) {
    deviceType = 'Tablet';
  }

  let browser = 'Browser';
  if (/edg\//i.test(ua)) {
    browser = 'Microsoft Edge';
  } else if (/opr\/|opera/i.test(ua)) {
    browser = 'Opera';
  } else if (/chrome|crios/i.test(ua)) {
    browser = 'Google Chrome';
  } else if (/firefox|fxios/i.test(ua)) {
    browser = 'Mozilla Firefox';
  } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
    browser = 'Apple Safari';
  } else if (/msie|trident/i.test(ua)) {
    browser = 'Internet Explorer';
  }

  let os = '';
  if (/windows nt 10.0/i.test(ua)) os = 'Windows 10/11';
  else if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  const fullDevice = os ? `${deviceType} (${os})` : deviceType;
  return {
    device: fullDevice,
    browser,
  };
};

/**
 * Check if an IP address is a private/local/reserved IP
 */
export const isPrivateOrLocalIp = (ip) => {
  if (!ip || ip === '127.0.0.1' || ip === 'localhost' || ip === '::1') return true;
  if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('169.254.')) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;
  return false;
};

/**
 * Resolve IP Geolocation (City, State/Region, Country)
 * Gracefully times out in 2000ms so login is never blocked.
 */
export const resolveIpLocation = async (ip) => {
  if (!ip || isPrivateOrLocalIp(ip)) {
    return {
      city: 'Hyderabad (Dev/Local)',
      state: 'Telangana',
      country: 'India',
      ipAddress: ip || '127.0.0.1',
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city,query`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.status === 'success') {
        return {
          city: data.city || 'Unknown City',
          state: data.regionName || 'Unknown State',
          country: data.country || 'India',
          ipAddress: data.query || ip,
        };
      }
    }
  } catch (err) {
    // Graceful fallback on network timeout or DNS failure
  }

  return {
    city: 'Location Detected via IP',
    state: 'National Network',
    country: 'India',
    ipAddress: ip,
  };
};

/**
 * Capture full login metadata packet from request
 */
export const captureLoginMetadata = async (req) => {
  const ipAddress = extractClientIp(req);
  const uaString = req?.headers ? req.headers['user-agent'] : '';
  const { device, browser } = parseUserAgent(uaString);

  const now = new Date();
  const date = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const time = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const geo = await resolveIpLocation(ipAddress);

  return {
    date,
    time,
    city: geo.city || 'Unknown City',
    state: geo.state || 'Unknown State',
    country: geo.country || 'India',
    ipAddress: geo.ipAddress || ipAddress,
    device,
    browser,
    timestamp: now,
  };
};

export default {
  extractClientIp,
  parseUserAgent,
  resolveIpLocation,
  captureLoginMetadata,
};
