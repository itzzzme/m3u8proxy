export default function withCORS(headers, request) {
  headers["access-control-allow-origin"] = "*";
  const corsMaxAge = request.corsAnywhereRequestState.corsMaxAge;
  if (request.method === "OPTIONS" && corsMaxAge) {
    headers["access-control-max-age"] = corsMaxAge;
  }
  if (request.headers["access-control-request-method"]) {
    headers["access-control-allow-methods"] =
      request.headers["access-control-request-method"];
    delete request.headers["access-control-request-method"];
  }
  if (request.headers["access-control-request-headers"]) {
    headers["access-control-allow-headers"] =
      request.headers["access-control-request-headers"];
    delete request.headers["access-control-request-headers"];
  }
  headers["access-control-expose-headers"] = Object.keys(headers).join(",");
  return headers;
}
