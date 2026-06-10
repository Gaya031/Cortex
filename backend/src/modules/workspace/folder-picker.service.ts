import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface FolderPickerResult {
  canceled: boolean;
  path?: string;
}

async function runCommand(
  command: string,
  args: string[],
): Promise<FolderPickerResult> {
  try {
    const { stdout } = await execFileAsync(command, args, {
      timeout: 5 * 60 * 1000,
      windowsHide: false,
    });
    const selectedPath = stdout.trim();

    return selectedPath
      ? { canceled: false, path: selectedPath }
      : { canceled: true };
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error
      ? error.code
      : undefined;

    if (code === 1 || code === 2 || code === -128) {
      return { canceled: true };
    }

    throw error;
  }
}

export async function pickFolder(): Promise<FolderPickerResult> {
  if (process.platform === "darwin") {
    return runCommand("osascript", [
      "-e",
      'POSIX path of (choose folder with prompt "Select a repository folder")',
    ]);
  }

  if (process.platform === "win32") {
    return runCommand("powershell.exe", [
      "-NoProfile",
      "-Command",
      [
        "Add-Type -AssemblyName System.Windows.Forms",
        "$dialog = New-Object System.Windows.Forms.FolderBrowserDialog",
        "$dialog.Description = 'Select a repository folder'",
        "$dialog.ShowNewFolderButton = $false",
        "if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {",
        "  [Console]::Out.Write($dialog.SelectedPath)",
        "} else {",
        "  exit 2",
        "}",
      ].join("; "),
    ]);
  }

  if (process.platform === "linux") {
    try {
      return await runCommand("zenity", [
        "--file-selection",
        "--directory",
        "--title=Select a repository folder",
      ]);
    } catch {
      return runCommand("kdialog", ["--getexistingdirectory"]);
    }
  }

  throw new Error("Folder picker is not supported on this platform.");
}
