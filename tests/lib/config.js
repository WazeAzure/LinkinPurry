export const ENDPOINT = __ENV.ENDPOINT || "http://localhost:3000";

export const TEST_USERS = [
  {
    id: 1,
    email: "william.herring@example.com",
    password: "password123",
    publicProfileTargetId: 2,
  },
  {
    id: 2,
    email: "scott.johnson@example.com",
    password: "password123",
    publicProfileTargetId: 1,
  },
  {
    id: 14,
    email: "jordan.pruitt@example.com",
    password: "password123",
    publicProfileTargetId: 1,
  },
];

export function pickTestUser() {
  const index = Math.floor(Math.random() * TEST_USERS.length);
  return TEST_USERS[index];
}
