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


export function activate(context: vscode.ExtensionContext) {
	let path = vscode.workspace.getConfiguration().get('codeplayground.path') || '';
	if (iswindows && path === '/tmp/codeplayground') {
		let path = process.env.TEMP + '\\CodePlayground';
		vscode.workspace.getConfiguration().update('codeplayground.path', path, vscode.ConfigurationTarget.Global);
	}
	const disposable = vscode.commands.registerCommand('codeplayground.openPlayground', () => {
		let path: string = vscode.workspace.getConfiguration().get('codeplayground.path') || '';
		if (path === '') {
			vscode.window.showErrorMessage('Path is invalid', 'Change path', 'Reset path')
				.then(selection => {
					if (selection === 'Change path') {
						vscode.commands.executeCommand('workbench.action.openSettings', 'codeplayground.path');
					} else if (selection === 'Reset path') {
						path = iswindows ? process.env.TEMP + '\\CodePlayground' : '/tmp/codeplayground';
						vscode.workspace.getConfiguration().update('codeplayground.path', path, vscode.ConfigurationTarget.Global);
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
				if (error.code !== 'EEXIST') {
					vscode.window.showErrorMessage('Error creating directory ' + error.message);
					return;
				}
			});

	});
	context.subscriptions.push(disposable);
}


export function deactivate() {
	vscode.workspace.fs.delete(vscode.Uri.file(vscode.workspace.getConfiguration().get('codeplayground.path') || ''), { recursive: true });
}
