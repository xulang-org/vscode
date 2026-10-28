# Xu LSP（语言服务协议）

本扩展包含 LSP 客户端，服务端由外部 Xu SDK 提供。安装带有 `xu-lsp`
伴生工具的 SDK 后，`xu lsp` 通过 stdio 运行纯 Xu 实现的语言服务。
扩展包不包含编译器或服务端，构建扩展也不需要 Xu 源码。

```bash
# SDK 已安装且 xu 在 PATH 中（基于 stdio 的 JSON-RPC 2.0）
xu lsp

# 可选：在独立的 Xu 源码仓库中构建工具（需要该仓库的 bin/xu）
cd /path/to/xu
make xu-lsp
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
  },
  "[xu]": {
    "editor.defaultFormatter": "xu-lang.xu-language"
  }
}
```

也可将 `xu.languageServerPath` 指向 `xu-lsp`（Windows 为 `xu-lsp.exe`）的绝对路径；
扩展会直接运行该工具。配置为编译器 `xu` 时，扩展会添加 `lsp` 参数。
修改路径后运行 **Xu: Restart Language Server**；启动失败时用
**Xu: Show Language Server Output** 查看输出。

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

## 当前服务端能力与边界（扩展 v0.3.1）

下述范围取决于所安装的 Xu 服务端。当前实现主要通过声明扫描和文本匹配
查询符号，尚不提供全工程语义索引。

1. **实时语法与类型诊断**：
   - 监听文档生命周期（`textDocument/didOpen`、`textDocument/didChange`、`textDocument/didSave`、`textDocument/didClose`）
   - 将缓存的编辑内容写入临时 `.xu` 文件，调用 `xu check`，读取临时诊断输出文件后清理这些临时文件，并推送 `textDocument/publishDiagnostics`
   - 支持 Pull 模式诊断接口 `textDocument/diagnostic`；该接口检查磁盘上的文件，未保存的编辑可能与推送诊断不同

2. **代码一键格式化（Document Formatting）**：
   - 协议接口：`textDocument/formatting`（快捷键 Shift+Option+F / Shift+Alt+F）
   - 使用 Xu 的 `#xu/format` 格式化当前文档

3. **符号跳转（Go to Definition）**：
   - 协议接口：`textDocument/definition`（快捷键 F12）
   - **模块导入直达**：在 `#strings`、`#encoding/json` 等导入语句上按 F12，直接打开对应模块入口文件（如 `mod.xu`）
   - **模块成员跳转**：查找 `strings.split` 等简单 `pkg.member` 形式；搜索可解析的标准库目录或当前文件目录下的模块目录
   - **同目录文件跳转**：搜索当前文件及同目录兄弟 `.xu` 文件中的声明
   - **声明匹配**：按声明文本查找函数、方法、结构体、枚举和常量；不保证解析所有依赖、局部变量或复杂成员链

4. **富文本文档悬停提示（Hover Tooltips）**：
   - 协议接口：`textDocument/hover`（鼠标悬停）
   - **内置原语与函数**：提供 `println`、`read_file`、`int`、`string`、`struct`、`xu`、`select` 等官方签名与 Markdown 文档
   - **模块与标准库悬停**：对可解析的简单模块成员提取声明及前置注释并渲染为 Markdown，查找范围与上述模块成员跳转相同
   - **用户自定义文档**：自动提取函数、结构体上方的连续 `//` 注释，原汁原味转换为格式化 Markdown 呈现

5. **文档符号大纲（Document Symbols & Outline）**：
   - 协议接口：`textDocument/documentSymbol`（快捷键 Cmd+Shift+O / Ctrl+Shift+O）
   - 按当前文件的声明行提取函数、方法、结构体、枚举和常量；范围为声明行，不是完整函数体或类型体

6. **代码补全（Code Completion）**：
   - 协议接口：`textDocument/completion`
   - 提示内置列表中的关键字、内置函数，以及当前文件中扫描到的函数、方法、结构体和常量声明
   - 不提供局部变量、结构体字段、复杂成员链或外部包的完整语义补全

7. **当前文件及同目录引用查询（Find All References）**：
   - 协议接口：`textDocument/references`（快捷键 Shift+F12）
   - 按标识符边界匹配当前文件的缓存内容，以及从磁盘读取的同目录兄弟 `.xu` 文件；不递归搜索工作区，也不校验包名
   - 简单过滤 `//` 注释；不做作用域或符号身份解析，同名符号、字符串和块注释可能产生误匹配

8. **当前文件重命名（Rename Symbol）**：
   - 协议接口：`textDocument/prepareRename` 与 `textDocument/rename`（快捷键 F2）
   - 检查标识符格式并排除服务端关键字列表中的名称
   - 仅为当前文档 URI 生成 `WorkspaceEdit`，采用与引用查询相同的文本匹配方式；不会同步修改其他文件
   - 使用重命名编辑预览逐项检查，尤其注意同名符号、字符串和块注释，并手动检查其他文件中的引用
