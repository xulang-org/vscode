# Xu for VS Code

<p align="center"><img src="images/icon.png" alt="Xu" width="72" height="72"></p>

Syntax highlighting for the **Xu** programming language (`.xu`). TextMate
grammar plus basic editor configuration (comments, brackets, auto-closing
pairs).

本扩展在独立 `vscode` 仓库维护，打包无需 Xu 编译器源码。与 `xu` 放在
同一父目录时，Xu 的安装和打包入口会自动发现它；其他位置可通过
`XU_VSCODE_ROOT` 指定。扩展使用独立的 `package.json` 版本。

> Highlighting only — no language server in this package. Use `xu check` /
> `xu lsp` for diagnostics.

## Features (aligned with Gen1 lexer)

- Keywords (`src/xu/ast/kind.xu` `lookup_keyword`):
  - control: `fn if else for in while match xu select or as is let`
  - declarations: `struct enum chan map any`
  - modifiers: `mut pub` · other: `const`
  - primitives: `int bool string f64 i32 u32 u8 byte`
  - **not** keywords: `interface` `module` `import` `return` `break` `continue` `Ok` `Err`
- Functions: `fn name(` / `fn (recv T) name(` / generics `fn f#T(`
- Strings: double-quoted `"..."` with `\n \t \r \\ \' \"`, `$$`, `$ident`;
  raw `` `...` `` (no escapes). Single quotes are not language strings.
- Numbers: decimal / float / hex / **binary** (`0b`) with `_` separators
- Comments: `//` and `/* … */`
- `@main` / `#path` / `#path as alias` / `alias #path`：`@`/`#` 与后面的名字/路径分属不同 scope（标点 vs 包名 vs 导入路径字符串色）
- `xu.` path segment (not spawn keyword)
- Builtins: `println` `eprintln` `str` `parse_int` `parse_float` `args`
  `read_file` … `assert` `close` plus hosted `pid` `cwd` `env_get` …
- Operators（分 scope）:
  - 语句控制流 → `keyword.control.flow.xu`：`<<` return / `>>` throw / `<<<` exit / 无操作数 `->` continue / `<-` break
  - 表达式移位 → `keyword.operator.bitwise.xu`：`<<` `>>`
  - 区间 → `keyword.operator.range.xu`：`a:b` 的 `:`（for 头 / 切片 `[]` / match 整数臂，半开 `[start, end)`）
  - channel → `keyword.operator.channel.xu`：`ch <- x` / `<-ch`

## Install

### Recommended — .vsix（Cursor / VS Code 都用这个）

符号链接在 Cursor 里经常不生效；请用真实安装：

```bash
cd vscode
npm ci
npm run package
cursor --install-extension xu-language-*.vsix --force   # Cursor
code --install-extension xu-language-*.vsix --force     # VS Code
```

然后 *Developer: Reload Window*。右下角语言模式应为 **Xu**（可在设置里加 `"files.associations": { "*.xu": "xu" }`）。

### Option — symlink（仅 VS Code 开发用）

```bash
mkdir -p ~/.vscode/extensions
EXTENSION_VERSION=$(node -p "require('./package.json').version")
ln -sfn "$PWD" "$HOME/.vscode/extensions/xu-lang.xu-language-$EXTENSION_VERSION"
```

## Scope map

| `punctuation.definition.package.xu` | 行首 `@` |
| `entity.name.package.xu` | `@` 后包名 |
| `punctuation.definition.import.xu` | 行首 `#` |
| `string.unquoted.import.xu` | `#` 后导入路径 |
| `variable.other.import-alias.xu` | 导入别名 |
| `punctuation.definition.constraint.xu` | 粘连 `struct@` / `f#T` 的 `@`/`#` |
| `keyword.control.flow.xu` | 语句 `<<`/`>>`/`<<<`；无操作数 `->`/`<-`；`or >>` |
| `keyword.operator.bitwise.xu` | 表达式移位 `<<` `>>` |
| `keyword.operator.range.xu` | `a:b` 区间（`for i in a:b`、`xs[lo:hi]`、match `0:13`） |
| `keyword.operator.channel.xu` | `ch <- x` / `<-ch` |
| `storage.type.xu` | `struct enum chan map any` |
| `storage.type.primitive.xu` | `int bool string f64 i32 u32 u8 byte` |
| `support.function.builtin.xu` | language builtins |
| `string.quoted.other.raw.xu` | raw `` `...` `` |

## License

MIT
