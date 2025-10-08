export interface RegisterDto {
    username: string;
    email: string;
    password: string;
    name: string;
}

export interface LoginDto {
    identifier: string;
    password: string;
}

export interface AuthResponse {
    // user: {
    //     id: string;
    //     username: string;
    //     email: string;
    //     fullName: string | null;
    //     profilePhotoPath: string;
    // };
    success: boolean,
    message: string,
    body: {
        token: string;
    }
}