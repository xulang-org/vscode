# 参与 Xu 编辑器扩展开发

请遵守 [XU GitHub 仓库管理规范](https://github.com/xulang-org/xulang-org/blob/main/.github/REPOSITORY_RULES.md)。日常任务从 `dev` 建分支并通过 PR 合回，正式交付进入 `main`；后台门禁按 [配置清单](https://github.com/xulang-org/xulang-org/blob/main/.github/GITHUB_SETTINGS.md) 单独启用。

XU 源码还须遵守 [XU 代码规范](https://github.com/xulang-org/xu/blob/main/.github/XU_CODING_STANDARDS.md)；涉及配套语言或跨语言接口时，按各语言工具链及其中的边界契约验证。

扩展版本由 `package.json` 管理，独立于 Xu SDK；扩展内容变化时同一批交付递增一次，并按需更新锁文件。仅修改贡献指南、仓库规则或模板时，不递增扩展版本。

## 修改与验证

从仓库根执行；使用与锁文件兼容的 Node.js 和 npm，打包不要求编译器 checkout：

```sh
npm ci
npm run package
```

修改扩展内容后检查本次版本的 VSIX：元数据、语法、编辑器配置、图标和编译后的扩展入口齐全；Git 元数据、本机配置、依赖缓存及研发记录不进入发行包。`.vscodeignore` 使用公开文件白名单；贡献指南和模板也不应意外进入扩展包。

涉及语法、诊断或 LSP 时，按 README 和 `LSP.md` 做实际编辑器验证，并说明所用 Xu 编译器版本。仅治理文件修订时检查文档、链接、表单、模板一致性与打包排除规则即可。

## 提交 PR

说明用户可见变化、复现或使用步骤、编辑器与 SDK 环境、扩展版本、验证结果和回滚方法。源码提交不包含 VSIX、`node_modules/` 或 `dist/`；不把编译器和历史引导二进制打入扩展。
