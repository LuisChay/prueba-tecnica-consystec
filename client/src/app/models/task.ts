export interface Task {
    id?: number;
    name: string;
    description: string;
    finished: boolean;
    user_id?: number;
}