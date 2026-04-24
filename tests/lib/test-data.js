import { check } from "k6";
import { get, post } from "./request.js";

const DEFAULT_PASSWORD = "password123";

export function createTestUsers(count = 2) {
  const runId = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const users = [];

  for (let index = 0; index < count; index += 1) {
    const username = `k6_user_${runId}_${index + 1}`;
    const email = `${username}@example.com`;

    const response = post("/api/signup", {
      username,
      email,
      password: DEFAULT_PASSWORD,
    });

    check(response, {
      "signup status is ok": (res) => res.status === 201,
    });

    const body = response.json();
    check(body, {
      "signup response has token": (payload) =>
        Boolean(
          payload &&
            payload.success === true &&
            payload.body &&
            typeof payload.body.token === "string"
        ),
    });

    users.push({
      username,
      email,
      password: DEFAULT_PASSWORD,
      token: body?.body?.token,
    });
  }

  const directoryResponse = get("/api/connection/public");
  check(directoryResponse, {
    "public users list status is ok": (res) => res.status === 200,
  });

  const directoryBody = directoryResponse.json();
  const directoryUsers = Array.isArray(directoryBody?.data) ? directoryBody.data : [];

  for (const user of users) {
    const record = directoryUsers.find(
      (candidate) => candidate.username === user.username || candidate.email === user.email
    );

    check(record, {
      "created user is discoverable": (value) =>
        Boolean(value && value.id && value.username === user.username),
    });

    user.id = String(record?.id ?? "");
  }

  return users;
}

export function createFeedPost(token, content) {
  const response = post(
    "/api/feed/",
    {
      content,
    },
    { token }
  );

  check(response, {
    "create post status is ok": (res) => res.status === 201,
  });

  const body = response.json();
  check(body, {
    "create post response shape is ok": (payload) =>
      Boolean(payload && payload.success === true && payload.data && payload.data.id),
  });

  return body?.data ?? null;
}
