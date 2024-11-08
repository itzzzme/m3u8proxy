addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  if (url.pathname === "/m3u8-proxy") {
    return handleM3U8Proxy(request);
  } else if (url.pathname === "/ts-proxy") {
    return handleTsProxy(request);
  }

  return new Response("Not Found", { status: 404 });
}

async function handleM3U8Proxy(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");
  const headers = JSON.parse(searchParams.get("headers") || "{}");

  if (!targetUrl) {
    return new Response("URL is required", { status: 400 });
  }

  try {
    const response = await fetch(targetUrl, { headers });
    if (!response.ok) {
      return new Response("Failed to fetch the m3u8 file", { status: response.status });
    }

    let m3u8 = await response.text();
    m3u8 = m3u8
      .split("\n")
      .filter(line => !line.startsWith("#EXT-X-MEDIA:TYPE=AUDIO"))
      .join("\n");

    if (m3u8.includes("RESOLUTION=")) {
      const lines = m3u8.split("\n");
      const newLines = [];

      lines.forEach(line => {
        if (line.startsWith("#")) {
          if (line.startsWith("#EXT-X-KEY:")) {
            const regex = /https?:\/\/[^\""\s]+/g;
            const keyUrl = regex.exec(line)?.[0] ?? "";
            const newUrl = `/ts-proxy?url=${encodeURIComponent(keyUrl)}&headers=${encodeURIComponent(JSON.stringify(headers))}`;
            newLines.push(line.replace(keyUrl, newUrl));
          } else {
            newLines.push(line);
          }
        } else {
          const uri = new URL(line, targetUrl);
          newLines.push(`/m3u8-proxy?url=${encodeURIComponent(uri.href)}&headers=${encodeURIComponent(JSON.stringify(headers))}`);
        }
      });

      return new Response(newLines.join("\n"), {
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Methods": "*",
        },
      });
    }

    const lines = m3u8.split("\n");
    const newLines = [];

    lines.forEach(line => {
      if (line.startsWith("#")) {
        if (line.startsWith("#EXT-X-KEY:")) {
          const regex = /https?:\/\/[^\""\s]+/g;
          const keyUrl = regex.exec(line)?.[0] ?? "";
          const newUrl = `/ts-proxy?url=${encodeURIComponent(keyUrl)}&headers=${encodeURIComponent(JSON.stringify(headers))}`;
          newLines.push(line.replace(keyUrl, newUrl));
        } else {
          newLines.push(line);
        }
      } else {
        const uri = new URL(line, targetUrl);
        newLines.push(`/ts-proxy?url=${encodeURIComponent(uri.href)}&headers=${encodeURIComponent(JSON.stringify(headers))}`);
      }
    });

    return new Response(newLines.join("\n"), {
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*",
      },
    });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}

async function handleTsProxy(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");
  const headers = JSON.parse(searchParams.get("headers") || "{}");

  if (!targetUrl) {
    return new Response("URL is required", { status: 400 });
  }

  const url = new URL(targetUrl);
  const requestHeaders = new Headers({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
    ...headers,
  });

  try {
    const response = await fetch(url.href, {
      method: request.method,
      headers: requestHeaders,
    });

    if (!response.ok) {
      return new Response("Failed to fetch segment", { status: response.status });
    }

    const contentType = "video/mp2t";
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*",
      },
    });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}
