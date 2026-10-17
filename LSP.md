# Xu LSP（语言服务协议）

Xu 产品编译器已原生自举支持 `xu lsp`（基于同级伴生工具 `xu-lsp`，纯 Xu 语言实现，非 Rust primer oracle 镜像）。

```bash
# 构建 LSP 工具
cd xu && make xu-lsp

# 直接运行（基于 stdio 的 JSON-RPC 2.0）
xu lsp
# 或
bin/xu-lsp
```

---

## 编辑器配置指南

### 1. VS Code / Cursor 配置

在 VS Code / Cursor 的 `settings.json` 中配置：

```json
{
  "xu.languageServerPath": "xu",
  "files.associations": {
    "*.xu": "xu"
  }
}
```

若 `xu` 未在系统全局 `PATH` 中，请配置为本地绝对路径：

```json
{
  "xu.languageServerPath": "/path/to/xu/bin/xu"
}
```

### 2. Neovim 配置 (nvim-lspconfig)

```lua
local lspconfig = require('lspconfig')
local configs = require('lspconfig.configs')

if not configs.xulang then
  configs.xulang = {
    default_config = {
      cmd = { 'xu', 'lsp' },
      filetypes = { 'xu' },
      root_dir = lspconfig.util.root_pattern('xu.xun', '.git'),
      settings = {},
    },
  }
end

lspconfig.xulang.setup{}
```

### 3. Helix 编辑器配置 (`languages.toml`)

```toml
[[language]]
name = "xu"
scope = "source.xu"
injection-regex = "xu"
file-types = ["xu"]
roots = ["xu.xun", ".git"]
language-servers = [ "xu-lsp" ]

[language-server.xu-lsp]
command = "xu"
args = ["lsp"]
```

---

## 已就绪能力列表（v0.3.0）

1. **实时语法与类型诊断**：
   - 监听文档生命周期（`textDocument/didOpen`、`textDocument/didChange`、`textDocument/didSave`、`textDocument/didClose`）
   - 内存无落盘实时检查，快速推送 `textDocument/publishDiagnostics`
   - 支持 Pull 模式诊断接口 `textDocument/diagnostic`

2. **代码一键格式化（Document Formatting）**：
   - 协议接口：`textDocument/formatting`（快捷键 Shift+Option+F / Shift+Alt+F）
   - 完整复用 Xu 标准库原生格式化引擎 `#xu/format`

3. **跨模块与跨文件符号跳转（Go to Definition）**：
   - 协议接口：`textDocument/definition`（快捷键 F12）
   - **模块导入直达**：在 `#strings`、`#encoding/json` 等导入语句上按 F12，直接打开对应模块入口文件（如 `mod.xu`）
   - **跨模块成员跳转**：在 `strings.split` 等调用处按 F12，穿透跳转到标准库或依赖包中的函数、类型定义行
   - **单模块同目录文件多文件跳转**：自动跨同目录兄弟 `.xu` 文件定位符号
   - **单文件符号跳转**：精准定位函数、接收者方法、结构体、枚举与常量定义

4. **富文本文档悬停提示（Hover Tooltips）**：
   - 协议接口：`textDocument/hover`（鼠标悬停）
   - **内置原语与函数**：提供 `println`、`read_file`、`int`、`string`、`struct`、`xu`、`select` 等官方签名与 Markdown 文档
   - **跨模块与标准库悬停**：自动提取标准库模块中的函数声明及前置注释并渲染为 Markdown
   - **用户自定义文档**：自动提取函数、结构体上方的连续 `//` 注释，原汁原味转换为格式化 Markdown 呈现

5. **文档符号大纲（Document Symbols & Outline）**：
   - 协议接口：`textDocument/documentSymbol`（快捷键 Cmd+Shift+O / Ctrl+Shift+O）
   - 点亮编辑器的 Outline 大纲视图，分类提取 Function、Method、Struct、Enum、Constant 符号及其代码范围

6. **代码智能补全（Code Completion）**：
   - 协议接口：`textDocument/completion`
   - 智能提示 Xu 核心关键字、内置函数，以及当前文件与模块已声明符号

7. **全工程/跨文件查找引用（Find All References）**：
   - 协议接口：`textDocument/references`（快捷键 Shift+F12）
   - 精确词法边界分词匹配（杜绝子串误报），跨当前文件与同目录同包文件检索
   - **智能排除注释**：仅匹配真实代码符号，智能过滤单行注释与行尾注释内的同名字词

8. **安全符号重构重命名（Rename Symbol）**：
   - 协议接口：`textDocument/prepareRename` 与 `textDocument/rename`（快捷键 F2）
   - 支持光标处符号重命名合法性校验，保护语言核心关键字免受意外修改
   - 自动生成遵循 LSP 标准的 `WorkspaceEdit`，一键无损同步重构所有代码引用
