// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { url } from 'inspector';
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
async function checkfile(path: string, filename: string, ext: string) {
	let flag = false;
	let uri;
	while (!flag) {
		try {
			await vscode.workspace.fs.stat(vscode.Uri.file(path + '\\' + filename));
			console.log('File exists');
			filename = 'playground' + Math.floor(Math.random() * 1000) + ext;
			uri = vscode.Uri.file(path + '\\' + filename);
		} catch (error) {
			console.log('File does not exist');
			uri = vscode.Uri.file(path + '\\' + filename);
			flag = true;
		}
	}
	return uri
}
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// if os is windows set the default path to %TEMP%\CodePlayground
	if (process.platform === 'win32') {
		var path = process.env.TEMP + '\\CodePlayground';
		vscode.workspace.getConfiguration().update('codeplayground.path', path, vscode.ConfigurationTarget.Global);
	}
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('codeplayground.openPlayground', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		let path: string = vscode.workspace.getConfiguration().get('codeplayground.path') || '';
		if (path === '') {
			vscode.window.showErrorMessage('Path not valid');
			return;
		}
		Promise.resolve(vscode.workspace.fs.createDirectory(vscode.Uri.file(path)))
			.then(() => {
				vscode.window.showInputBox({ prompt: 'Enter the extension of the playground' }).then((ext) => {
					if (ext === undefined || ext === '' || ext === null) {
						return;
					}
					if (!ext.startsWith('.')) {
						ext = '.' + ext;
					}
					let filename = 'playground' + Math.floor(Math.random() * 1000) + ext;
					let uri = vscode.Uri.file(path + '\\' + filename);
					checkfile(path, filename, ext).then((uri) => {
						if (uri === undefined) {
							vscode.window.showErrorMessage('Error creating file, uri is undefined');
							return;
						}
						Promise.resolve(vscode.workspace.fs.writeFile(uri, new Uint8Array(Buffer.from(''))))
							.then(() => {
								vscode.window.showInformationMessage('File created successfully');
								vscode.workspace.openTextDocument(uri).then((doc) => {
									vscode.window.showTextDocument(doc, { preview: false });
								});
							})
							.catch(error => {
								vscode.window.showErrorMessage('Error creating file ' + error.message);
							});
					});
				}
				);
			})
			.catch(error => {
				// if error is file exists error, pass
				if (error.code !== 'EEXIST') {
					vscode.window.showErrorMessage('Error creating directory ' + error.message);
					return;
				}
			});

	});
	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
	vscode.workspace.fs.delete(vscode.Uri.file(vscode.workspace.getConfiguration().get('codeplayground.path') || ''));
}
