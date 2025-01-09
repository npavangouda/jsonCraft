# jsonCraft Visual Studio Code
[![VisualStudioMarketplace](https://img.shields.io/badge/VisualStudioMarketplace-v1.0.0-orange.svg)]()

This extension adds json formatting support for Visual Studio Code in contextmenu.

---
## About

GitHub: https://github.com/npavangouda/jsonCraft

<p align="center"><img src="https://raw.githubusercontent.com/npavangouda/jsonCraft/master/assets/jsonCraft.png" alt="jsonCraft" width="300"/></p>

---
## **Features**

### 1. **Handle Special Characters**
- Converts HTML entities (e.g., `&#34;`) to their JSON-safe equivalents (e.g., `"`).
- Handles nested and escaped characters seamlessly.

<p align="left"><img src="https://raw.githubusercontent.com/npavangouda/jsonCraft/master/assets/jsonCraft_format.gif" alt="jsonCraft"/></p>

### 2. **Format JSON**
- Beautify JSON data for better readability.
- Indents JSON objects and arrays to make them human-readable.

### 3. **Partial Formatting**
- Format only the selected portion of JSON in your document without affecting the rest.

### 4. **Error Handling**
- Provides informative error messages for invalid JSON structures.
- Displays a message when no content is available for formatting.

### 6. **User-Friendly Commands**
- Easily accessible through the **Command Palette** (`Ctrl+Shift+P` or `Cmd+Shift+P`) or the **Context Menu**:
  - **Command**: `jsonCraft: Format JSON`
  - **Context Menu**: Right-click in the editor and select **FormatMyJson**.

### 7. **Keyboard Shortcuts**
- Configure your own keyboard shortcuts for the `jsonCraft: Format JSON` command to streamline usage.

---

## **How to Use**

### **Format JSON**
1. Open a file with JSON content or paste the JSON string into the editor.
2. Right-click anywhere in the editor and select **FormatMyJson** from the context menu.
3. Alternatively, open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`), type `jsonCraft`, and select **jsonCraft: Format JSON**.
4. To format only a part of the JSON, select the desired section before running the command.



---
## Release Notes

### 1.0.0

Initial release of jsonCraft


**Enjoy!**
