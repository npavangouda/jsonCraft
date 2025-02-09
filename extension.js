const vscode = require('vscode');
const { decode } = require('he');
const parseJson = require('json-parse-even-better-errors');

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {

	console.log('Extension "jsonCraft" is now active!');

	const escapeDoubleQuotes = (inputString) => {
		let result = inputString;
		let endIndex = result.indexOf('"",');
		while (endIndex !== -1) {
			// traverse reverse from endIndex to find '":"'
			let startIndex = endIndex;
			while (startIndex >= 0 && result.substring(startIndex, startIndex + 3) !== '":"') {
				startIndex--;
			}

			// set new start point to find from to current start index + 3
			let newStartPointToFindFrom = startIndex + 3;
			// if there is text between startIndex and endIndex, escape all double quotes
			if (startIndex >= 0 && startIndex < endIndex - 3) {
				const textToEscape = result.substring(startIndex + 3, endIndex + 1);
				const escapedText = textToEscape.replace(/"/g, '\\"');
				// update the newStartPointToFindFrom to include the length of escaped text
				newStartPointToFindFrom += escapedText.length;
				result = result.substring(0, startIndex + 3) + escapedText + result.substring(endIndex + 1);
			}
			// find the next occurrence of '","' from new start point
			// using addition of 2 instead of 3 as escapedText length has already accounted for one doublequote.
			endIndex = result.indexOf('"",', newStartPointToFindFrom + 2);
		}
		return result;
	};

	const processString = (inputString) => {
		let result = inputString;

		// Replace \&#34; with &#34;
		result = result.replace(/\\&#34;/g, '&#34;');
		// decode using the 'he' npm package
		result = decode(result);
		// only remove the double quotes in the begnning and end of the string
		result = result.replace(/^"/, '').replace(/"$/, '');
		// replace "body":"{" with "body":{"
		result = result.replace(/"body":"\{"/g, '"body":{"');
		// only at the end of the string, replace }"} with }}
		result = result.replace(/}"}$/, '}}');

		result = escapeDoubleQuotes(result);

		return result;
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

			let processedText = processString(text);
			let finalJsonText;
			let isParseError = false;
			try {
				// Parse the decoded text as JSON
				let formattedJson = parseJson(processedText);
				// Format JSON with indentation
				finalJsonText = JSON.stringify(formattedJson, null, 4);
			} catch (error) {
				isParseError = true;
				finalJsonText = processedText;
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
			}).then(() => {
				// Move caret to the beginning
				const newPosition = new vscode.Position(0, 0); // Line 0, Column 0
				editor.selection = new vscode.Selection(newPosition, newPosition);
				// Ensure the editor scrolls to the top
				editor.revealRange(new vscode.Range(newPosition, newPosition), vscode.TextEditorRevealType.AtTop);
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
