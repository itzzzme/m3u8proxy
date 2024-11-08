import dotenv from "dotenv";
import createServer from "./createServer.js";
import colors from "colors";

dotenv.config();

const host = process.env.HOST || "127.0.0.1";
const port = process.env.PORT || 8080;
const web_server_url = process.env.PUBLIC_URL || `http://${host}:${port}`;

export default function server() {
  createServer({
    originBlacklist: ["*"],
    originWhitelist: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : [],
    requireHeader: [],
    removeHeaders: [
      "cookie",
      "cookie2",
      "x-request-start",
      "x-request-id",
      "via",
      "connect-time",
      "total-route-time",
    ],
    redirectSameOrigin: true,
    httpProxyOptions: {
      xfwd: false,
    },
  }).listen(port, Number(host), function () {
    console.log(
      colors.green("Server running on ") + colors.blue(`${web_server_url}`)
    );
  });
}
