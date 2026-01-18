/**
 * Production Server for SafePick Frontend
 * Includes security headers to pass ZAP security scans
 */

const express = require("express");
const path = require("path");
const helmet = require("helmet");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Security: Helmet with strict CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // React needs inline styles
        imgSrc: ["'self'", "data:", "blob:"],
        fontSrc: ["'self'"],
        connectSrc: [
          "'self'",
          process.env.REACT_APP_API_URL || "http://localhost:3001",
        ],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"], // Prevents clickjacking
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false, // Needed for some assets
    crossOriginResourcePolicy: { policy: "same-origin" },
  }),
);

// ✅ Remove X-Powered-By header
app.disable("x-powered-by");

// ✅ Additional security headers
app.use((req, res, next) => {
  // Anti-clickjacking (backup for CSP frame-ancestors)
  res.setHeader("X-Frame-Options", "DENY");

  // Prevent MIME-sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // XSS Protection for older browsers
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Referrer Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()",
  );

  // HSTS for HTTPS
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload",
  );

  // Remove Server header
  res.removeHeader("Server");

  next();
});

// ✅ CORS restrictivo (solo para APIs específicas si es necesario)
// No usamos cors() con * para evitar vulnerabilidades

// ✅ Serve static files from build folder
app.use(
  express.static(path.join(__dirname, "build"), {
    etag: false, // Disable ETag to avoid timestamp disclosure
    lastModified: false,
  }),
);

// ✅ Handle React Router (SPA fallback)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ SafePick Frontend running securely on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
});
