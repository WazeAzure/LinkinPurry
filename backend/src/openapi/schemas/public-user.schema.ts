export const publicUserProfileSchema = {
    tags: ['User'],
    summary: "User Profile",
    response: {
      200: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          body: {
            type: "object",
            properties: {
              username: { type: "string" },
              name: { type: "string" },
              work_history: { type: "string" },
              skills: { type: "string" },
              connection_count: { type: "integer" },
              profile_photo: { type: "string" },
              accessLevel: { type: "string" },
            },
            required: [
              "username",
              "name",
              "work_history",
              "skills",
              "connection_count",
              "profile_photo",
            ],
          },
        },
        required: ["success", "message", "body"],
      },
    },
  };