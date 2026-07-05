export interface UserWithRoles {
    id: number;
    username: string;
    roles: string[];
}

export interface PhotoForApproval {
    id: number;
    url: string;
    isApproved: boolean;
    appUserId: number;
    username: string;
}
