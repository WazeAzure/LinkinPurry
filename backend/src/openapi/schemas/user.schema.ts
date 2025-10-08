export const userProfileSchema = {
  tags: ['User'],
  summary: "User Profile",
  headers: {
    type: "object",
    properties: {
      Cookie: {
        type: "string",
        description: "Cookie containing session or authentication token",
      },
    },
    required: ["Cookie"],
  },
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
            relevant_posts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  created_at: { type: "string", format: "date-time" },
                  updated_at: { type: "string", format: "date-time" },
                  content: { type: "string" },
                  user: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      username: { type: "string" },
                      profile_photo: { type: "string" },
                    },
                    required: ["id", "username", "profile_photo"],
                  },
                },
                required: ["id", "created_at", "updated_at", "content", "user"],
              },
            },
            accessLevel: { type: "string" },
          },
          required: [
            "username",
            "name",
            "work_history",
            "skills",
            "connection_count",
            "profile_photo",
            "relevant_posts",
          ],
        },
      },
      required: ["success", "message", "body"],
    },
  },
};

export const updateProfileSchema = {
  tags: ['User'],
  summary: "update user informations",
  schema: {
      params: {
          type: 'object',
          required: ['user_id'],
          properties: {
              user_id: { type: 'string' }
          }
      },
      body: {
          type: 'object',
          // required: ['username', 'name'],
          properties: {
              username: { type: 'string', minLength: 3 },
              name: { type: 'string', minLength: 2 },
              work_history: { type: 'string' },
              skills: { type: 'string' },
              profile_photo: { type: 'string' } // For file upload
          }
      },
      response: {
          200: {
              type: 'object',
              properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  body: {
                      type: 'object',
                      properties: {
                          username: { type: 'string' },
                          name: { type: 'string' },
                          work_history: { type: 'string' },
                          skills: { type: 'string' },
                          connection_count: { type: 'number' },
                          profile_photo: { type: 'string' },
                          relevant_posts: { type: 'array', items: { type: 'object' } }
                      }
                  }
              }
          }
      }
  }
};