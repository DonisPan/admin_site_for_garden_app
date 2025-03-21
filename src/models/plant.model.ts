export interface Plant {
    user_id: number | null;
    id: number;
    name: string;
    note: string | null;
    class: number | null;
    family: number | null;
    is_custom: boolean;
}