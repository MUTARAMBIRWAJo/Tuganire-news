(function () {
  const API_BASE = "/api";

  function detectDeviceType(ua: string): "desktop" | "tablet" | "mobile" | "other" {
    const l = ua.toLowerCase();
    if (/mobile|iphone|ipod|android.+mobile/.test(l)) return "mobile";
    if (/ipad|tablet|android(?!.*mobile)/.test(l)) return "tablet";
    if (/smart-tv|hbbtv|appletv/.test(l)) return "other";
    return "desktop";
  }

  function detectOS(ua: string): string {
    if (/windows nt 10\.0/i.test(ua)) return "Windows 10";
    if (/windows nt 11\.0/i.test(ua)) return "Windows 11";
    if (/windows nt/i.test(ua)) return "Windows";
    if (/android/i.test(ua)) return "Android";
    if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
    if (/mac os x/i.test(ua)) return "macOS";
    if (/linux/i.test(ua)) return "Linux";
    return "Other";
  }

  function detectBrowser(ua: string): string {
    if (/edg\//i.test(ua)) return "Edge";
    if (/chrome\//i.test(ua) && !/edg\//i.test(ua)) return "Chrome";
    if (/safari/i.test(ua) && !/chrome\//i.test(ua)) return "Safari";
    if (/firefox\//i.test(ua)) return "Firefox";
    if (/msie|trident/i.test(ua)) return "IE";
    return "Other";
  }

  function getVisitorId(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("visitor_id");
  }

  function setVisitorId(id: string) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("visitor_id", id);
  }

  function getSessionToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.sessionStorage.getItem("session_token");
  }

  function setSessionToken(token: string) {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem("session_token", token);
  }

  async function trackVisitor() {
    if (typeof window === "undefined") return null;

    const ua = navigator.userAgent || "";
    const deviceType = detectDeviceType(ua);
    const os = detectOS(ua);
    const browser = detectBrowser(ua);
    const referrer = document.referrer || null;

    const existingVisitorId = getVisitorId();
    const existingSessionToken = getSessionToken();

    const payload = {
      visitorId: existingVisitorId || null,
      browser,
      os,
      deviceType,
      referrer,
      sessionToken: existingSessionToken || null,
    };

    const res = await fetch(`${API_BASE}/track-visitor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.warn("track-visitor failed", await res.text());
      return null;
    }

    const data = await res.json();
    if (data.visitorId) setVisitorId(data.visitorId);
    if (data.sessionId) setSessionToken(data.sessionId);

    return data as { visitorId: string; sessionId?: string } | null;
  }

  async function trackArticleView(articleId: string) {
    const visitorId = getVisitorId();
    if (!visitorId) {
      console.warn("No visitorId available for trackArticleView");
      return null;
    }

    const ua = navigator.userAgent || "";
    const deviceType = detectDeviceType(ua);
    const os = detectOS(ua);
    const browser = detectBrowser(ua);

    const referrer = document.referrer || null;
    const path = window.location.pathname + window.location.search;
    const sessionId = getSessionToken() || null;

    const payload = {
      visitorId,
      sessionId,
      articleId,
      browser,
      os,
      deviceType,
      referrer,
      path,
    };

    const res = await fetch(`${API_BASE}/track-article-view`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.warn("track-article-view failed", await res.text());
      return null;
    }

    const data = await res.json();
    return (data && data.articleViewId) || null;
  }

  async function trackTimeSpent(params: {
    articleViewId?: string | null;
    visitorId?: string | null;
    articleId?: string | null;
    timeSpentSeconds: number;
  }) {
    if (!params.timeSpentSeconds || params.timeSpentSeconds <= 0) return;

    const payload = {
      articleViewId: params.articleViewId || null,
      visitorId: params.visitorId || null,
      articleId: params.articleId || null,
      timeSpentSeconds: params.timeSpentSeconds,
    };

    try {
      await fetch(`${API_BASE}/track-time-spent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        keepalive: true,
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn("track-time-spent failed", e);
    }
  }

  async function trackShare(params: {
    articleId: string;
    platform: string;
    metadata?: Record<string, unknown>;
  }) {
    if (!params.articleId || !params.platform) return;

    const payload = {
      articleId: params.articleId,
      visitorId: getVisitorId(),
      sessionId: getSessionToken(),
      platform: params.platform,
      path: typeof window !== "undefined" ? window.location.pathname + window.location.search : null,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      metadata: params.metadata || {},
    };

    try {
      await fetch(`${API_BASE}/track-share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        keepalive: true,
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn("track-share failed", e);
    }
  }

  async function initVisitorTracking() {
    try {
      await trackVisitor();
    } catch (e) {
      console.warn("initVisitorTracking error", e);
    }
  }

  function initArticleTracking(articleId: string) {
    if (!articleId) {
      console.error("initArticleTracking: articleId is required");
      return;
    }

    let articleViewId: string | null = null;
    const start = Date.now();

    trackVisitor()
      .then(async () => {
        const resId = await trackArticleView(articleId);
        articleViewId = resId;
      })
      .catch((e) => console.warn("Article tracking setup error", e));

    function sendTimeSpent() {
      const diffMs = Date.now() - start;
      const timeSpentSeconds = Math.floor(diffMs / 1000);
      const visitorId = getVisitorId();

      trackTimeSpent({
        articleViewId,
        visitorId,
        articleId,
        timeSpentSeconds,
      });
    }

    window.addEventListener("beforeunload", sendTimeSpent);
    window.addEventListener("pagehide", sendTimeSpent);
  }

  if (typeof window !== "undefined") {
    (window as any).VisitorTracking = {
      initVisitorTracking,
      initArticleTracking,
      trackShare,
    };
  }
})();
