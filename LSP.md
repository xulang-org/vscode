# Xu LSP（M196）

当前 hosted Xu（`src/` 产品链）尚未镜像 `lsp`；下面的命令是**显式
oracle/recovery 路径**，只用于编辑器诊断，不是产品自举或发布证据。

```bash
BOOTSTRAP_ROOT="${XU_BOOTSTRAP_ROOT:-../bootstrap}"
cargo build --manifest-path "$BOOTSTRAP_ROOT/Cargo.toml" -p xu
XU_BOOT="$BOOTSTRAP_ROOT/target/debug/xu"
XUPATH="${XU_ROOT:-../xu}/src" "$XU_BOOT" lsp
```

## Cursor / VS Code 配置

在 `settings.json` 中添加（需安装支持自定义 LSP 的扩展，或 Cursor 内置 LSP 配置）。
该路径明确指向 Rust primer，仅用于 oracle/recovery：

```json
{
  "xu.languageServerPath": "/absolute/path/to/bootstrap/target/debug/xu",
  "files.associations": {
    "*.xu": "xu"
  }
}
```

LSP 能力（v0.1）：

- `textDocument/diagnostic` — 复用 `xu check`
- `textDocument/definition` — 跳转到同文件 `fn` 定义

Gen1 侧 `xu lsp` 尚未实现；产品 lane 不得把 `bootstrap/target` 当作 hosted seed。
若要使用 LSP，请保留上面的显式 `XU_BOOT` oracle 命令，并将诊断结果标为
`oracle`，直到 hosted 产品实现可用。
