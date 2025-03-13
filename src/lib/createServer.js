import getHandler from "./getHandler.js";
import httpProxy from "http-proxy";
import http from "node:http";

export default function createServer(options) {
  options = options || {};

  const httpProxyOptions = {
    xfwd: true,
    secure: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== "0",
  };

  if (options.httpProxyOptions) {
    Object.keys(options.httpProxyOptions).forEach(function (option) {
      httpProxyOptions[option] = options.httpProxyOptions[option];
    });
  }

  const proxyServer = httpProxy.createProxyServer(httpProxyOptions);
  const requestHandler = getHandler(options, proxyServer);
  let server;

  const handleCors = (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
  
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return true;
    }
    return false;
  };

  const isOriginAllowed = (origin, options) => {
    if (options.originWhitelist.includes("*")) {
      return true;
    }
    if (
      options.originWhitelist.length &&
      !options.originWhitelist.includes(origin)
    ) {
      return false;
    }
    if (
      options.originBlacklist.length &&
      options.originBlacklist.includes(origin)
    ) {
      return false;
    }
    return true;
  };

  if (options.httpsOptions) {
    server = https.createServer(options.httpsOptions, (req, res) => {
      const origin = req.headers.origin || "";
      if (!isOriginAllowed(origin, options)) {
        res.writeHead(403, "Forbidden");
        res.end(
          `The origin "${origin}" was blacklisted by the operator of this proxy.`
        );
        return;
      }
      if (handleCors(req, res)) return;
      requestHandler(req, res);
    });
  } else {
    server = http.createServer((req, res) => {
      const origin = req.headers.origin || "";
      if (!isOriginAllowed(origin, options)) {
        res.writeHead(403, "Forbidden");
        res.end(
          `The origin "${origin}" was blacklisted by the operator of this proxy.`
        );
        return;
      }
      if (handleCors(req, res)) return;
      requestHandler(req, res);
    });
  }

  proxyServer.on("error", function (err, req, res) {
    console.error("Proxy error:", err);
    if (res.headersSent) {
      if (!res.writableEnded) {
        res.end();
      }
      return;
    }

    const headerNames = res.getHeaderNames
      ? res.getHeaderNames()
      : Object.keys(res._headers || {});
    headerNames.forEach(function (name) {
      res.removeHeader(name);
    });

    res.writeHead(404, { "Access-Control-Allow-Origin": "*" });
    res.end("Not found because of proxy error: " + err);
  });

  return server;
}
