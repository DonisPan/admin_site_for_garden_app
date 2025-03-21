export interface User {
    id: number;
    auth_id: string;
    name: string;
    surname: string;
    created_at: string;
    email: string | null;
}