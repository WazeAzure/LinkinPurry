import { Feed } from "../entities/feed.entity.js";

export interface ResponseUserDto {
    success: boolean,
    message: string,
    body: {
        username: string,
        name: string,
        work_history: string,
        skills: string,
        connection_count: number,
        profile_photo: string,
        relevant_posts: Feed[],
    };
}

export interface UpdateUserDTO {
    username: string,
    name: string,
    work_history: string,
    skills: string,
    connection_count: number,
    profile_photo: File
}
