import { check } from "k6";
import { get } from "./lib/request.js";
import { createFeedPost, createTestUsers } from "./lib/test-data.js";

export let options = {
  stages: [
    { duration: "5s", target: 50 },
    { duration: "10s", target: 100 },
    { duration: "5s", target: 50 },
  ],
  thresholds: {
    http_req_duration: ["avg<8000", "p(95)<20000"],
    http_req_failed: ["rate<0.01"],
  },
};

export function setup() {
  const [author, secondUser] = createTestUsers(2);

  createFeedPost(author.token, "k6 seeded post 1");
  createFeedPost(author.token, "k6 seeded post 2");
  createFeedPost(secondUser.token, "k6 seeded post 3");

  return { author, secondUser };
}

export default function (data) {
  const author = data.author;
  const token = author.token;

  let publicCursor = getPublicFeedPage();
  if (publicCursor) {
    getPublicFeedPage(publicCursor);
  }

  let authenticatedCursor = getAuthenticatedFeedPage(author.id, token);
  if (authenticatedCursor) {
    getAuthenticatedFeedPage(author.id, token, authenticatedCursor);
  }

  getUserFeed(author.id);
}

function getPublicFeedPage(cursor) {
  const res = get(
    "/api/feed/all?limit=20" + (cursor ? "&cursor=" + cursor : "")
  );

  check(res, {
    "public feed status is ok": (r) => r.status === 200,
  });

  const data = res.json();

  if (!data.body) {
    console.log(data);
  }

  check(data, {
    "public feed shape is ok": (d) =>
      d &&
      d.success === true &&
      d.body &&
      Array.isArray(d.body.feeds),
  });

  return data?.body?.cursor ?? null;
}

function getAuthenticatedFeedPage(userId, token, cursor) {
  const res = get(
    "/api/feed/all/" + userId + "?limit=20" + (cursor ? "&cursor=" + cursor : ""),
    { token }
  );

  check(res, {
    "authenticated feed status is ok": (r) => r.status === 200,
  });

  const data = res.json();

  if (!data.body) {
    console.log(data);
  }

  check(data, {
    "authenticated feed shape is ok": (d) =>
      d &&
      d.success === true &&
      d.body &&
      Array.isArray(d.body.feeds),
  });

  return data?.body?.cursor ?? null;
}

function getUserFeed(userId) {
  const res = get("/api/feed/" + userId);

  check(res, {
    "user feed status is ok": (r) => r.status === 200,
  });

  const data = res.json();

  check(data, {
    "user feed shape is ok": (d) =>
      d && d.success === true && Array.isArray(d.data),
  });
}
