# Edit a chart

## Find and replace

Press `Ctrl` + `F` to find text and `Ctrl` + `H` to replace it. The find-and-replace panel works much like the one in common text editors such as Visual Studio Code.

## Chart text tools

These tools are available in both the context menu and the **Edit** menu.

![Chart text tools](/majdatax/usage/edit/edit-tools.png)

Each tool processes the text you have selected.

Pull requests that add more chart text tools to MajdataX are welcome. A tool only needs to be a class derived from `IMajPlugin`. See [MirrorPlugin.cs](https://github.com/re-poem/MajdataEdit-Neo/blob/main/Models/Plugins/MirrorPlugin.cs) for an example.
