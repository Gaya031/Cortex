import {
  FileTreeNode,
  ProjectFile,
} from "@/types/file.types";

function sortNodes(nodes: FileTreeNode[]) {
  return nodes.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "folder" ? -1 : 1;
    }

    return a.name.localeCompare(b.name);
  });
}

export function buildFileTree(
  files: ProjectFile[],
): FileTreeNode[] {
  const root: FileTreeNode[] = [];

  files.forEach((file) => {
    const parts = file.path.split("/").filter(Boolean);
    let level = root;

    parts.forEach((part, index) => {
      const path = parts.slice(0, index + 1).join("/");
      const isFile = index === parts.length - 1;

      let node = level.find((item) => item.path === path);

      if (!node) {
        node = {
          id: path,
          name: part,
          path,
          type: isFile ? "file" : "folder",
          language: isFile ? file.language : undefined,
          extension: isFile ? file.extension : undefined,
          size: isFile ? file.size : undefined,
          children: [],
        };

        level.push(node);
      }

      level = node.children;
    });
  });

  const walk = (nodes: FileTreeNode[]) => {
    sortNodes(nodes);
    nodes.forEach((node) => walk(node.children));
  };

  walk(root);
  return root;
}

export function getFileName(path: string) {
  return path.split("/").pop() ?? path;
}
