export interface ResponseConnectionDto {
    success: boolean,
    message: string,
    body: {
        from_id: number,
        to_id: number,
        created_at: Date;
    };
}

export interface ConnectDto {
    from_id: number,
    to_id: number,
    created_at: Date;
}  