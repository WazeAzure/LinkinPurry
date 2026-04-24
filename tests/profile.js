import { check } from "k6";
import { get } from "./lib/request.js";
import { createTestUsers } from "./lib/test-data.js";

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
  const [owner, target] = createTestUsers(2);
  return { owner, target };
}

export default function (data) {
  const owner = data.owner;
  const target = data.target;
  const userId = owner.id;
  const token = owner.token;

  const res = get("/api/profile/" + userId, { token });

  check(res, {
    "status is ok": (r) => r.status === 200,
  });

  const profilePayload = res.json();

  if (!profilePayload.body) {
    console.log(profilePayload);
  }

  check(profilePayload, {
    "authenticated profile shape is ok": (d) =>
      d &&
      d.success === true &&
      d.body &&
      d.body.username === owner.username &&
      typeof d.body.connection_count === "number" &&
      d.body.accessLevel === "owner",
  });

  const otherUserId = target.id;

  const otherProfile = get("/api/profile/public/" + otherUserId);

  check(otherProfile, {
    "other profile is ok": (p) => p.status === 200,
  });

  const otherProfileData = otherProfile.json().body;

  check(otherProfileData, {
    "public profile shape is ok": (p) =>
      p &&
      p.username === target.username &&
      typeof p.connection_count === "number" &&
      p.accessLevel === "public",
  });
}
