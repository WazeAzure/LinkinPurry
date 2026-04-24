import { ENDPOINT } from "./config.js";
import http from "k6/http";

export function get(path, { token } = {}) {
  return http.get(ENDPOINT + path, {
    headers: {
      ...(token ? { Cookie: `authToken=${token}` } : {}),
    },
  });
}

export function post(path, body, { token } = {}) {
  return http.post(ENDPOINT + path, JSON.stringify(body), {
    headers: {
      ...(token ? { Cookie: `authToken=${token}` } : {}),
      "Content-Type": "application/json",
    },
  });
}
