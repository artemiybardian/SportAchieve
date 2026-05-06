

export type ListItemBDUI = {
    meta: Record<string, unknown>;
    items: unknown[];
    content: string;
}

export type ListBDUI = {
    meta: Record<string, unknown>;
    style: string;
    items: ListItemBDUI[];
}
