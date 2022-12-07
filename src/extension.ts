import * as vscode from 'vscode';

function pad(num: number, size: number) {
  let string = num.toString();
  while (string.length < size) {
    string = `0${string}`;
  }
  return string;
}

function parseTime(value: string): number {
  const sign = value.startsWith('-') ? -1 : 1;

  const segments = value
    .replace(/^-/, '')
    .split(':')
    .map((segment) => {
      if (segment.length === 0) {
        return 0;
      }
      return parseInt(segment);
    });

  if (segments.length === 1) {
    return segments[0] * sign;
  } else if (segments.length === 2) {
    return (segments[0] * 60 + segments[1]) * sign;
  } else if (segments.length === 3) {
    return (segments[0] * 60 * 60 + segments[1] * 60 + segments[2]) * sign;
  }

  throw new Error('Invalid timestamp string');
}

function formatTime(value: number): string {
  const hours = Math.floor(value / (60 * 60));
  const minutes = Math.floor(value / 60) % 60;
  const seconds = value % 60;

  if (hours > 0) {
    return `${hours}:${pad(minutes, 2)}:${pad(seconds, 2)}`;
  }

  return `${minutes}:${pad(seconds, 2)}`;
}

console.log('HERE!!!!');

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    'shift-timestamps.shift-timestamps',
    async () => {
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        const input = await vscode.window.showInputBox({
          placeHolder: '00:00',
          prompt: 'Amount of time to shift times by',
          value: ''
        });

        if (!input) {
          vscode.window.showErrorMessage('Invalid time');
          return;
        }

        const timeShift = parseTime(input);

        const document = editor.document;
        const selection = editor.selection;
        console.log('is empty: ', selection.isEmpty);
        const range = selection.isEmpty
          ? new vscode.Range(
              document.positionAt(0),
              document.positionAt(document.getText().length - 1)
            )
          : selection;

        const text = document.getText(range);

        const pattern = /(\d?\d:)?\d?\d:\d\d/g;

        const replacement = text.replace(pattern, (timestamp) => {
          return formatTime(parseTime(timestamp) + timeShift);
        });

        editor.edit((editBuilder) => {
          editBuilder.replace(range, replacement);
        });
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
