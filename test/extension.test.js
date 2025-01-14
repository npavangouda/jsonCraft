
const { fail, deepStrictEqual, strictEqual } = require('assert');
const { workspace, window, commands } = require('vscode');
const { existsSync, readFileSync } = require('fs');
const { join } = require('path');
const { encode } = require('he');
// const myExtension = require('../extension');

suite('Extension Test Suite', () => {

	const testScenarios = [{
		fileName: 'sample1.json',
		title: 'Test Small size json'
	}, {
		fileName: 'sample2.json',
		title: 'Test Medium size json'
	}, {
		fileName: 'sample3.json',
		title: 'Test start-end with double quotes and internal json is still invalid'
	}];

	const generateInput = (data) => {
		let encodedData = JSON.stringify(data, (key, value) =>
			typeof value === 'string' ? encode(value) : value
		);
		// Escape the encoded characters
		let escapedData = encodedData.replace(/"/g, '\&#34;');

		return escapedData;
	};

	testScenarios.forEach((testScenario) => {
		test(testScenario.title, async () => {
			const sampleFilePath = join(__dirname, 'data', testScenario.fileName);
			if (!existsSync(sampleFilePath)) {
				fail(`File not found: ${sampleFilePath}`);
			}


			const sampleData = JSON.parse(readFileSync(sampleFilePath, 'utf8'));

			let input = sampleData.input;
			const expectedOutput = sampleData.output;

			if (!input && !expectedOutput) {
				fail('Input and expected output are missing in the sample file');
			}

			if (!input && expectedOutput) {
				// call the function generateInput
				input = generateInput(expectedOutput);
			}

			const editor = await workspace.openTextDocument({ content: input, language: 'json' });
			const document = await window.showTextDocument(editor);
			await commands.executeCommand('editor.action.selectAll');
			await commands.executeCommand('editor.action.triggerSuggest');
			await commands.executeCommand('jsonCraft.formatJson');

			// Wait for the UI to update
			await new Promise(resolve => setTimeout(resolve, 100));

			const formattedText = JSON.parse(document.document.getText());

			deepStrictEqual(formattedText, expectedOutput);

			await commands.executeCommand('workbench.action.closeActiveEditor');
		});
	});

	test('Test invalid JSON', async () => {
		const input = `{
    "name": "John",
    "age": 30,
    "city": "New York`;
		const editor = await workspace.openTextDocument({ content: input, language: 'json' });
		const document = await window.showTextDocument(editor);
		await commands.executeCommand('editor.action.selectAll');
		await commands.executeCommand('editor.action.triggerSuggest');
		await commands.executeCommand('jsonCraft.formatJson');

		const finalContent = document.document.getText();
		strictEqual(finalContent, input, 'The document should remain unchanged.');

		await commands.executeCommand('workbench.action.closeActiveEditor');
	});

	test('Test empty input', async () => {
		const editor = await workspace.openTextDocument({ content: '', language: 'json' });
		const document = await window.showTextDocument(editor);
		await commands.executeCommand('editor.action.selectAll');
		await commands.executeCommand('editor.action.triggerSuggest');
		await commands.executeCommand('jsonCraft.formatJson');

		const finalContent = document.document.getText();
		strictEqual(finalContent, '', 'The document should remain empty for empty input.');

		await commands.executeCommand('workbench.action.closeActiveEditor');
	}
	);

});
