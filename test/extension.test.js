
const assert = require('assert');

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const he = require('he');
// const myExtension = require('../extension');

suite('Extension Test Suite', () => {

	const testScenarios = [{
		fileName: 'sample1.json',
		title: 'Test Small size json'
	}, {
		fileName: 'sample2.json',
		title: 'Test Medium size json'
	}];

	const generateInput = (data) => {
		let encodedData = JSON.stringify(data, (key, value) =>
			typeof value === 'string' ? he.encode(value) : value
		);
		// Escape the encoded characters
		let escapedData = encodedData.replace(/"/g, '\&#34;');

		return escapedData;
	};

	testScenarios.forEach((testScenario) => {
		test(testScenario.title, async () => {
			const sampleFilePath = path.join(__dirname, 'data', testScenario.fileName);
			if (!fs.existsSync(sampleFilePath)) {
				assert.fail(`File not found: ${sampleFilePath}`);
			}


			const sampleData = JSON.parse(fs.readFileSync(sampleFilePath, 'utf8'));

			let input = sampleData.input;
			const expectedOutput = sampleData.output;

			if (!input && !expectedOutput) {
				assert.fail('Input and expected output are missing in the sample file');
			}

			if (!input && expectedOutput) {
				// call the function generateInput
				input = generateInput(expectedOutput);
			}

			const editor = await vscode.workspace.openTextDocument({ content: input, language: 'json' });
			const document = await vscode.window.showTextDocument(editor);
			await vscode.commands.executeCommand('editor.action.selectAll');
			await vscode.commands.executeCommand('editor.action.triggerSuggest');
			await vscode.commands.executeCommand('jsonify.formatJson');

			// Wait for the UI to update
			await new Promise(resolve => setTimeout(resolve, 100));

			const formattedText = JSON.parse(document.document.getText());

			assert.deepStrictEqual(formattedText, expectedOutput);

			await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
		});
	});

	test('Test invalid JSON', async () => {
		const input = '{ "name": "John", "age": 30, "city": "New York" ';
		const editor = await vscode.workspace.openTextDocument({ content: input, language: 'json' });
		const document = await vscode.window.showTextDocument(editor);
		await vscode.commands.executeCommand('editor.action.selectAll');
		await vscode.commands.executeCommand('editor.action.triggerSuggest');
		await vscode.commands.executeCommand('jsonify.formatJson');

		const finalContent = document.document.getText();
		assert.strictEqual(finalContent, input, 'The document should remain unchanged.');

		await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
	});

	test('Test empty input', async () => {
		const editor = await vscode.workspace.openTextDocument({ content: '', language: 'json' });
		const document = await vscode.window.showTextDocument(editor);
		await vscode.commands.executeCommand('editor.action.selectAll');
		await vscode.commands.executeCommand('editor.action.triggerSuggest');
		await vscode.commands.executeCommand('jsonify.formatJson');

		const finalContent = document.document.getText();
		assert.strictEqual(finalContent, '', 'The document should remain empty for empty input.');

		await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
	}
	);

});
