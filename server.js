const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number.parseInt(process.env.PORT || "3080", 10);
const ROOT_DIR = __dirname;
const PUBLIC_DIR = path.join(ROOT_DIR, "public");

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

const INDEX_FILE = path.join(ROOT_DIR, "index.html");

function safeResolve(baseDir, requestPath) {
  const normalized = path.normalize(path.join(baseDir, requestPath));
  if (!normalized.startsWith(baseDir)) return null;
  return normalized;
}

function resolveRequest(urlPath) {
  if (urlPath === "/" || urlPath === "") return INDEX_FILE;

  if (urlPath.startsWith("/public/")) {
    return safeResolve(PUBLIC_DIR, urlPath.replace("/public/", ""));
  }

  return safeResolve(ROOT_DIR, urlPath.slice(1));
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const filePath = resolveRequest(urlPath);

  if (!filePath) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("File not found");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPES[extension] || "application/octet-stream";

    fs.readFile(filePath, (readError, content) => {
      if (readError) {
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(`Server error: ${readError.code}`);
        return;
      }

      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log("\n=== VisionSearch Local Demo ===");
  console.log(`Server running at: http://localhost:${PORT}`);
  console.log("Press Ctrl+C to stop.\n");
});
