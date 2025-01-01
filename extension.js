// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "jsonify" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('jsonify.formatJson', async function () {
		// The code you place here will be executed every time your command is executed
		const parseJson = (await import('parse-json')).default;
		const he = (await import('he')).default;

		// Display a message box to the user
		// vscode.window.showInformationMessage('Hello World from jsonify!');
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			vscode.window.showErrorMessage('No active editor found.');
			return;
		}

		const text = editor.document.getText();

		if (!text) {
			vscode.window.showInformationMessage('No text found in the editor.');
			return
		}

		try {
			// Dynamically import the 'parse-json' and 'he' packages
			const parseJson = (await import('parse-json')).default;
			const he = (await import('he')).default;

			// Decode HTML entities using 'he' package
			const decodedText = he.decode(text);

			// Parse the decoded text as JSON
			const formattedJson = parseJson(decodedText);

			// Format JSON with indentation
			const prettyJson = JSON.stringify(formattedJson, null, 4);

			// Apply changes to the editor
			editor.edit((editBuilder) => {
				const fullRange = new vscode.Range(
					editor.document.positionAt(0),
					editor.document.positionAt(text.length)
				);
				editBuilder.replace(fullRange, prettyJson);
			});
		} catch (error) {
			vscode.window.showErrorMessage(
				`Failed to format JSON: ${error.message}`
			);
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
