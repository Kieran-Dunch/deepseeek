// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import ollama from 'ollama';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "deepseek-kieran-ext" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('deepseek-kieran-ext.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from deepseek-kieran-ext!');
    const panel = vscode.window.createWebviewPanel(
      'deepchat',
      'Deep Chat',
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    panel.webview.html = getWebviewContent();

    panel.webview.onDidReceiveMessage(async (message:any) => {
      if (message.command === 'ask') {
        const userPrompt = message.text;
        let responseText = '';

        try {
          const streamResponse = await ollama.chat({
            model: 'deepseek-r1:1.5b',
            messages: [{ role: 'user', content: userPrompt }],
            stream: true
          })

          for await (const response of streamResponse) {
            responseText += response.message.content
            panel.webview.postMessage({ command: 'chatResponse', text: responseText })
          }

        } catch (error) {
          panel.webview.postMessage({ command: 'chatResponse', text: 'Error: ' + String(error) })
        }
      }
	  });
  });


	context.subscriptions.push(disposable);
}


function getWebviewContent(): string {
  return /* html */ `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Deep Seek Chat Extension</title>
  </head>
  <body>
      <h1>Deep Seek Chat Extension</h1>
      <textarea id="prompt" cols="30" rows="3" placehoder="ask something"></textarea><br />
      <button id="askBtn">Ask</button>
      <div id='response'></div>

      <script>
        const vscode = acquireVsCodeApi();

        const askBtn = document.getElementById('askBtn');
        askBtn.addEventListener('click', () => {
          const prompt = document.getElementById('prompt').value;
          vscode.postMessage({
            command: 'ask',
            question: prompt
          });
        });

        window.addEventListener('message', event => {
          const { command, text } = event.data;
          if (command === 'chatResponse') {
            const response = document.getElementById('response');
            response.innerHTML = text;
          }
        });
      </script>
  </body>
  </html>`;
}

// This method is called when your extension is deactivated
export function deactivate() {}
