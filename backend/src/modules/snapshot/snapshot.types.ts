export interface SnapshotFile{
    filePath: string;
    content: string;
}

export interface Snapshot{
    workspaceId: string;
    files: SnapshotFile[];
}

