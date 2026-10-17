import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node';

let client: LanguageClient | undefined;
let statusBarItem: vscode.StatusBarItem | undefined;

function findBinaryInPath(binName: string): string | undefined {
  const envPath = process.env.PATH || '';
  const delimiter = process.platform === 'win32' ? ';' : ':';
  const extensions = process.platform === 'win32' ? ['.exe', '.cmd', '.bat', ''] : [''];
  const dirs = envPath.split(delimiter);

  for (const dir of dirs) {
    for (const ext of extensions) {
      const full = path.join(dir, binName + ext);
      if (fs.existsSync(full)) {
        try {
          fs.accessSync(full, fs.constants.X_OK);
          return full;
        } catch {
          // not executable, continue
        }
      }
    }
  }
  return undefined;
}

function resolveServerCommand(): { command: string; args: string[] } | undefined {
  const config = vscode.workspace.getConfiguration('xu');
  const configuredPath = config.get<string>('languageServerPath', 'xu').trim();

  // If user configured a specific executable path (not "xu")
  if (configuredPath && configuredPath !== 'xu') {
    const resolved = path.isAbsolute(configuredPath)
      ? configuredPath
      : path.resolve(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '.', configuredPath);
    if (fs.existsSync(resolved)) {
      const base = path.basename(resolved).toLowerCase();
      if (base === 'xu-lsp' || base === 'xu-lsp.exe') {
        return { command: resolved, args: [] };
      }
      return { command: resolved, args: ['lsp'] };
    }
  }

  // Auto-detection strategy:
  // 1. Check workspace ./bin/xu or ./bin/xu-lsp
  for (const folder of vscode.workspace.workspaceFolders || []) {
    const candidates = [
      path.join(folder.uri.fsPath, 'bin', process.platform === 'win32' ? 'xu.exe' : 'xu'),
      path.join(folder.uri.fsPath, 'bin', process.platform === 'win32' ? 'xu-lsp.exe' : 'xu-lsp'),
    ];
    for (const cand of candidates) {
      if (fs.existsSync(cand)) {
        const base = path.basename(cand).toLowerCase();
        if (base.startsWith('xu-lsp')) {
          return { command: cand, args: [] };
        }
        return { command: cand, args: ['lsp'] };
      }
    }
  }

  // 2. Check XU_ROOT environment variable
  if (process.env.XU_ROOT) {
    const xuFromRoot = path.join(
      process.env.XU_ROOT,
      'bin',
      process.platform === 'win32' ? 'xu.exe' : 'xu'
    );
    if (fs.existsSync(xuFromRoot)) {
      return { command: xuFromRoot, args: ['lsp'] };
    }
    const xuLspFromRoot = path.join(
      process.env.XU_ROOT,
      'bin',
      process.platform === 'win32' ? 'xu-lsp.exe' : 'xu-lsp'
    );
    if (fs.existsSync(xuLspFromRoot)) {
      return { command: xuLspFromRoot, args: [] };
    }
  }

  // 3. Check sibling repository: ../xu/bin/xu
  const siblingXu = path.resolve(
    __dirname,
    '../../xu/bin',
    process.platform === 'win32' ? 'xu.exe' : 'xu'
  );
  if (fs.existsSync(siblingXu)) {
    return { command: siblingXu, args: ['lsp'] };
  }

  // 4. Check system PATH
  const pathXu = findBinaryInPath('xu');
  if (pathXu) {
    return { command: pathXu, args: ['lsp'] };
  }
  const pathXuLsp = findBinaryInPath('xu-lsp');
  if (pathXuLsp) {
    return { command: pathXuLsp, args: [] };
  }

  // 5. Default fallback to PATH invocation
  return { command: 'xu', args: ['lsp'] };
}

async function startLanguageServer(context: vscode.ExtensionContext): Promise<void> {
  const resolved = resolveServerCommand();
  if (!resolved) {
    vscode.window.showErrorMessage(
      'Xu Language Server binary not found. Please install Xu or configure "xu.languageServerPath".'
    );
    return;
  }

  const serverOptions: ServerOptions = {
    run: {
      command: resolved.command,
      args: resolved.args,
      transport: TransportKind.stdio,
    },
    debug: {
      command: resolved.command,
      args: resolved.args,
      transport: TransportKind.stdio,
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'xu' }],
    synchronize: {
      fileEvents: vscode.workspace.createFileSystemWatcher('**/*.xu'),
    },
    outputChannelName: 'Xu Language Server',
  };

  client = new LanguageClient('xu-lsp', 'Xu Language Server', serverOptions, clientOptions);

  try {
    await client.start();
    if (statusBarItem) {
      statusBarItem.text = '$(check) Xu LSP';
      statusBarItem.tooltip = `Xu Language Server active (${resolved.command})`;
      statusBarItem.show();
    }
  } catch (err) {
    if (statusBarItem) {
      statusBarItem.text = '$(error) Xu LSP';
      statusBarItem.tooltip = `Failed to start: ${err}`;
      statusBarItem.show();
    }
    vscode.window.showErrorMessage(`Failed to start Xu Language Server: ${err}`);
  }
}

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'xu.restartServer';
  context.subscriptions.push(statusBarItem);

  context.subscriptions.push(
    vscode.commands.registerCommand('xu.restartServer', async () => {
      if (client) {
        if (statusBarItem) {
          statusBarItem.text = '$(sync~spin) Xu LSP';
        }
        await client.stop();
        client = undefined;
      }
      await startLanguageServer(context);
      vscode.window.showInformationMessage('Xu Language Server restarted.');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('xu.showOutput', () => {
      client?.outputChannel.show();
    })
  );

  await startLanguageServer(context);
}

export async function deactivate(): Promise<void> {
  if (client) {
    await client.stop();
    client = undefined;
  }
}
