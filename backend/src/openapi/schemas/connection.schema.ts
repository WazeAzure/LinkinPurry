export const createConnectionSchema = {
    tags: ['Connection'],
    summary: 'Create a new connection',
    body: {
        type: 'object',
        required: ['from_id', 'to_id'],
        properties: {
        from_id: { type: 'string', format: 'uuid' },
        to_id: { type: 'string', format: 'uuid' },
        },
    },
    response: {
        201: {
        type: 'object',
        properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
            type: 'object',
            properties: {
                from_id: { type: 'string', format: 'uuid' },
                to_id: { type: 'string', format: 'uuid' },
                created_at: { type: 'string', format: 'date-time' },
            },
            },
        },
        },
    },
}; 

export const getConnectionListSchema = {
    tags: ['Connection'],
    summary: 'Retrieve a list of connections',
    params: {
        type: 'object',
        properties: {
        user_id: { type: 'string', format: 'uuid', description: 'ID of the user whose connections are to be retrieved' },
        },
    },
    response: {
        200: {
        type: 'object',
        properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                from: {
                    type: 'object',
                    properties: {
                    id: { type: 'string', format: 'uuid' },
                    username: { type: 'string' },
                    name: { type: 'string' },
                    profile_photo: { type: 'string' },
                    },
                },
                to: {
                    type: 'object',
                    properties: {
                    id: { type: 'string', format: 'uuid' },
                    username: { type: 'string' },
                    name: { type: 'string' },
                    profile_photo: { type: 'string' },
                    },
                },
                created_at: { type: 'string', format: 'date-time' },
                },
            },
            },
        },
        },
    },
};
 
export const deleteConnectionSchema = {
    tags: ['Connection'],
    summary: 'Delete an existing connection',
    params: {
        type: 'object',
        required: ['from_id', 'to_id'],
        properties: {
        from_id: { type: 'string', format: 'uuid', description: 'ID of the user who initiated the connection' },
        to_id: { type: 'string', format: 'uuid', description: 'ID of the user who is the recipient of the connection' },
        },
    },
    response: {
        200: {
        type: 'object',
        properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
        },
        },
    },
};
  