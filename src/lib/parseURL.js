import url from "node:url";

export default function parseURL(req_url) {
  const match = req_url.match(
    /^(?:(https?:)?\/\/)?(([^\/?]+?)(?::(\d{0,5})(?=[\/?]|$))?)([\/?][\S\s]*|$)/i
  );
  if (!match) {
    return null;
  }
  if (!match[1]) {
    if (/^https?:/i.test(req_url)) {
      return null;
    }
    if (req_url.lastIndexOf("//", 0) === -1) {
      req_url = "//" + req_url;
    }
    req_url = (match[4] === "443" ? "https:" : "http:") + req_url;
  }
  const parsed = url.parse(req_url);
  if (!parsed.hostname) {
    return null;
  }
  return parsed;
}
