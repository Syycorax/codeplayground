// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { url } from 'inspector';
import * as vscode from 'vscode';


let iswindows = process.platform === 'win32';
let sep = iswindows ? '\\' : '/';


async function checkfile(path: string, filename: string, ext: string) {
	let flag = false;
	let uri;
	while (!flag) {
		try {
			await vscode.workspace.fs.stat(vscode.Uri.file(path + sep + filename));
			filename = 'playground' + Math.floor(Math.random() * 10000) + ext;
			uri = vscode.Uri.file(path + sep + filename);
		} catch (error) {
			uri = vscode.Uri.file(path + sep + filename);
			flag = true;
		}
	}
	return uri
}
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// if os is windows set the default path to %TEMP%\CodePlayground
	let path = vscode.workspace.getConfiguration().get('codeplayground.path') || '';
	if (iswindows && path === '/tmp/codeplayground') {
		let path = process.env.TEMP + '\\CodePlayground';
		vscode.workspace.getConfiguration().update('codeplayground.path', path, vscode.ConfigurationTarget.Global);
	}
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('codeplayground.openPlayground', () => {
		// The code you place here will be executed every time your command is executed
		let path: string = vscode.workspace.getConfiguration().get('codeplayground.path') || '';
		if (path === '') {
			// Error message with a button to set the path
			vscode.window.showErrorMessage('Path is invalid', 'Change path', 'Reset path')
				.then(selection => {
					if (selection === 'Change path') {
						vscode.commands.executeCommand('workbench.action.openSettings', 'codeplayground.path');
					} else if (selection === 'Reset path') {
						vscode.workspace.getConfiguration().update('codeplayground.path', '/tmp/codeplayground', vscode.ConfigurationTarget.Global);
					}
				});
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
