
const vscode = require('vscode');
const { decode } = require('he');
const parseJson = require('json-parse-even-better-errors');

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {

	console.log('Extension "jsonCraft" is now active!');

	const cleanTextUsingPatterns = (inputString) => {
		let cleanedText = inputString;

		// Replace double quotes from the start and end of the text
		if (cleanedText.startsWith('"') && cleanedText.endsWith('"')) {
			cleanedText = cleanedText.slice(1, -1);
		}
		// Normalize escaped backslashes (\\ -> \)
		cleanedText = cleanedText
			.replace(/\\\\/g, '\\') // Normalize escaped backslashes (\\ -> \)
			.replace(/\\/g, '') // Normalize escaped backslashes (\ -> '')
			.replace(/"body":"\{"/g, '"body": {"') // Replace "body":"{" with "body": {"
			.replace(/}"}/g, '}}').replace(/}"]/, '}]'); // Replace "}"}" with "}}"
		if (cleanedText.indexOf(';for="') > 0) {
			cleanedText = cleanedText.replace(/;for="/g, ';for=\\"');
		}
		if (cleanedText.indexOf('""') > 0) {	
			cleanedText = cleanedText
				.replace(/:""/g, ':"\\"')
				.replace(/"",/g, '\\"",')
				.replace(/""}/g, '\\""}');
			// cleanedText = cleanedText.replace(/"([^"]*?)"/g, (match, group) => {
			// 	const escapedValue = group.replace(/"/g, '\\"'); // Escape unescaped double quotes
			// 	return escapedValue;
			// });
		}

	// cleanedText = cleanedText.replace(/^"|"$/g, '');
	return cleanedText;
};

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

		// set the language mode to JSON
		await vscode.languages.setTextDocumentLanguage(editor.document, 'json');

		// Remove unnecessary escape characters before HTML entities
		// let cleanedText = text.replace(/\\(&#[0-9]+;)/g, '$1');


		// Decode HTML entities using 'he' package
		let decodedText = decode(text);
		let cleanedText = cleanTextUsingPatterns(decodedText);
		let finalJsonText;
		let isParseError = false;
		try {
			// Parse the decoded text as JSON
			let formattedJson = parseJson(cleanedText);
			// Format JSON with indentation
			finalJsonText = JSON.stringify(formattedJson, null, 4);
		} catch (error) {
			isParseError = true;
			finalJsonText = cleanedText;
			vscode.window.showErrorMessage(`Failed to parse JSON: ${error.message}`);
		}


		// Apply changes to the editor
		editor.edit((editBuilder) => {
			if (selection.isEmpty) {
				const fullRange = new vscode.Range(
					editor.document.positionAt(0),
					editor.document.positionAt(text.length)
				);
				editBuilder.replace(fullRange, finalJsonText);
			} else {
				editBuilder.replace(selection, finalJsonText);
			}
		});

		// Trigger Format Document
		await vscode.commands.executeCommand('editor.action.formatDocument');

	} catch (error) {
		vscode.window.showErrorMessage(
			`Failed to craft JSON: ${error.message}`
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
