export default function createRateLimitChecker(CORSANYWHERE_RATELIMIT) {
  const rateLimitConfig = /^(\d+) (\d+)(?:\s*$|\s+(.+)$)/.exec(
    CORSANYWHERE_RATELIMIT
  );
  if (!rateLimitConfig) {
    return function checkRateLimit() {};
  }
  const maxRequestsPerPeriod = parseInt(rateLimitConfig[1]);
  const periodInMinutes = parseInt(rateLimitConfig[2]);
  let unlimitedPattern = rateLimitConfig[3];
  if (unlimitedPattern) {
    const unlimitedPatternParts = [];
    unlimitedPattern
      .trim()
      .split(/\s+/)
      .forEach(function (unlimitedHost, i) {
        const startsWithSlash = unlimitedHost.charAt(0) === "/";
        const endsWithSlash = unlimitedHost.slice(-1) === "/";
        if (startsWithSlash || endsWithSlash) {
          if (
            unlimitedHost.length === 1 ||
            !startsWithSlash ||
            !endsWithSlash
          ) {
            throw new Error(
              "Invalid CORSANYWHERE_RATELIMIT. Regex at index " +
                i +
                ' must start and end with a slash ("/").'
            );
          }
          unlimitedHost = unlimitedHost.slice(1, -1);

          new RegExp(unlimitedHost);
        } else {
          unlimitedHost = unlimitedHost.replace(/[$()*+.?[\\\]^{|}]/g, "\\$&");
        }
        unlimitedPatternParts.push(unlimitedHost);
      });
    unlimitedPattern = new RegExp(
      "^(?:" + unlimitedPatternParts.join("|") + ")$",
      "i"
    );
  }
  let accessedHosts = Object.create(null);
  setInterval(function () {
    accessedHosts = Object.create(null);
  }, periodInMinutes * 60000);

  const rateLimitMessage =
    "The number of requests is limited to " +
    maxRequestsPerPeriod +
    (periodInMinutes === 1
      ? " per minute"
      : " per " + periodInMinutes + " minutes") +
    ". " +
    "Please self-host CORS Anywhere if you need more quota. ";

  return function checkRateLimit(origin) {
    const host = origin.replace(/^[\w\-]+:\/\//i, "");
    if (unlimitedPattern && unlimitedPattern.test(host)) {
      return;
    }
    let count = accessedHosts[host] || 0;
    ++count;
    if (count > maxRequestsPerPeriod) {
      return rateLimitMessage;
    }
    accessedHosts[host] = count;
  };
}
