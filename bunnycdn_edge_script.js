import * as BunnySDK from "https://esm.sh/@bunny.net/edgescript-sdk@0.11.2";

/**
 * @param {Request} request -
 * @return {Response}
 */

// Default server URL provided manually
const web_server_url = "<public_url_of_edge_script>"; // Replace this with your public URL
const REFERER = "<custom_referer>";

BunnySDK.net.http.serve(async (request) => {
  const url = new URL(request.url);
  const headers = Object.fromEntries(request.headers.entries());

  if (url.pathname === "/m3u8-proxy") {
    return proxyM3U8(url, headers);
  } else if (url.pathname === "/ts-proxy") {
    return proxyTs(url, headers, request);
  }

  if (url.pathname === "/") {
    return new Response("Welcome to the Proxy Service", { status: 200 });
  }

  return new Response("Not Found", { status: 404 });
});

async function proxyM3U8(url, headers) {
  const targetUrl = url.searchParams.get("url");
  const targetHeaders = JSON.parse(url.searchParams.get("headers") || "{}");

  if (!targetUrl) {
    return new Response("URL is required", { status: 400 });
  }

  try {
    // Fetch the M3U8 file
    const response = await fetch(targetUrl, {
      headers: { Referer: REFERER },
    });
    if (!response.ok) {
      return new Response("Failed to fetch the M3U8 file", {
        status: response.status,
      });
    }

    let m3u8 = await response.text();
    m3u8 = m3u8
      .split("\n")
      .filter((line) => !line.startsWith("#EXT-X-MEDIA:TYPE=AUDIO"))
      .join("\n");

    const newLines = m3u8.split("\n").map((line) => {
      if (line.startsWith("#")) {
        if (line.startsWith("#EXT-X-KEY:")) {
          const regex = /https?:\/\/[^\""\s]+/g;
          const keyUrl = regex.exec(line)?.[0] ?? "";
          const newUrl = `/ts-proxy?url=${encodeURIComponent(
            keyUrl
          )}&headers=${encodeURIComponent(JSON.stringify(headers))}`;
          return line.replace(keyUrl, newUrl);
        }
        return line;
      } else {
        let uri;
        if (line.endsWith(".m3u8")) {
          // Handle M3U8 links
          uri = new URL(line, targetUrl);
          return `${web_server_url}/m3u8-proxy?url=${encodeURIComponent(
            uri.href
          )}&headers=${encodeURIComponent(JSON.stringify(headers))}`;
        } else if (!line.endsWith(".ts")) {
          // Handle TS segments
          uri = new URL(line, targetUrl);
          return `${web_server_url}/ts-proxy?url=${encodeURIComponent(
            uri.href
          )}&headers=${encodeURIComponent(JSON.stringify(headers))}`;
        } else {
          // Handle Other segments
          uri = new URL(line, targetUrl); 
          return `${web_server_url}/ts-proxy?url=${encodeURIComponent(
            uri.href
          )}&headers=${encodeURIComponent(JSON.stringify(headers))}`;
        }
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

async function proxyTs(url, headers, request) {
  const targetUrl = url.searchParams.get("url");
  const targetHeaders = JSON.parse(url.searchParams.get("headers") || "{}");

  if (!targetUrl) {
    return new Response("URL is required", { status: 400 });
  }

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: { Referer: REFERER },
    });

    if (!response.ok) {
      return new Response("Failed to fetch TS segment", {
        status: response.status,
      });
    }

    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": "video/mp2t",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*",
      },
    });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}
