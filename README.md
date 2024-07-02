# codeplayground
Quickly create and open a temporary file with the extension of your choice.
Just run the command `Create Playground` (or use the shortcut `CTRL-ALT-P`) and you will be prompted to enter the extension of the file you want to create. After entering the extension, a new file will be created in the path specified in the settings and opened in the editor.

## Extension Settings
* `codeplayground.path`: The path in which playgrounds will be created. (defaults to /tmp/codeplayground on Unix systems and C:\Users\<username>\AppData\Local\Temp\codeplayground on Windows)

## Release Notes
### 1.0.2
- Fixed linux path issue
- Excluded path setting from sync
- Added buttons for invalid path error
- Added more digits to the file name

### 1.0.1

Fixed a bug when discarding the input prompt

### 1.0.0

Initial release of codeplayground

