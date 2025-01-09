// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {

	console.log('Extension "jsonCraft" is now active!');

	const disposable = vscode.commands.registerCommand('jsonCraft.formatJson', async function () {
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			vscode.window.showErrorMessage('No active editor found.');
			return;
		}

		// check if any selection is made
		const selection = editor.selection;
		const text = selection.isEmpty ? editor.document.getText() : editor.document.getText(selection);

		if (!text) {
			vscode.window.showInformationMessage('No text found in the editor.');
			return
		}

		try {
			// Dynamically import the 'parse-json' and 'he' packages
			const parseJson = (await import('parse-json')).default;
			const he = (await import('he')).default;

			// Remove unnecessary escape characters before HTML entities
			let cleanedText = text.replace(/\\(&#[0-9]+;)/g, '$1');

			// Decode HTML entities using 'he' package
			let decodedText = he.decode(cleanedText);

			// Parse the decoded text as JSON
			const formattedJson = parseJson(decodedText);

			// Format JSON with indentation
			const prettyJson = JSON.stringify(formattedJson, null, 4);

			// Apply changes to the editor
			editor.edit((editBuilder) => {
				if (selection.isEmpty) {
					const fullRange = new vscode.Range(
						editor.document.positionAt(0),
						editor.document.positionAt(text.length)
					);
					editBuilder.replace(fullRange, prettyJson);
				} else {
					editBuilder.replace(selection, prettyJson);
				}
			});
		} catch (error) {
			vscode.window.showErrorMessage(
				`Failed to format JSON: ${error.message}`
			);
		}
	});

	context.subscriptions.push(disposable);
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
