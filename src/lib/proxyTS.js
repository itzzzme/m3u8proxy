import https from "node:https";
import http from "node:http";

export async function proxyTs(url, headers, req, res) {
  let forceHTTPS = false;

  if (url.startsWith("https://")) {
    forceHTTPS = true;
  }

  const uri = new URL(url);
  const options = {
    hostname: uri.hostname,
    port: uri.port,
    path: uri.pathname + uri.search,
    method: req.method,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
      ...headers,
    },
  };
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");

  try {
    if (forceHTTPS) {
      const proxy = https.request(options, (r) => {
        r.headers["content-type"] = "video/mp2t";
        res.writeHead(r.statusCode ?? 200, r.headers);

        r.pipe(res, {
          end: true,
        });
      });

      req.pipe(proxy, {
        end: true,
      });
    } else {
      const proxy = http.request(options, (r) => {
        r.headers["content-type"] = "video/mp2t";
        res.writeHead(r.statusCode ?? 200, r.headers);

        r.pipe(res, {
          end: true,
        });
      });
      req.pipe(proxy, {
        end: true,
      });
    }
  } catch (e) {
    res.writeHead(500);
    res.end(e.message);
    return null;
  }
}
