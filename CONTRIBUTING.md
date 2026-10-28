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

`LICENSE` 保留扩展自身的 MIT 许可，并附有 bundle 中依赖的完整许可文本和上游通知。
可从仓库根生成构建清单，按 `outputs["dist/extension.js"].inputs` 中
`bytesInOutput` 大于零的条目确认实际打入 bundle 的包：

```sh
mkdir -p tmp
npm run build -- --metafile=tmp/extension-metafile.json
```

更新依赖时，按该清单核对 `node_modules/<包名>/` 下的许可及通知文件，
同步附录中的包版本和原文，再检查 VSIX 中的 `extension/LICENSE.txt`。不要只依赖
构建器保留注释；构建工具自身未进入 bundle 时无需列入发行包的依赖附录。
上游包的通知文件应保留原文；其中提到其他项目不代表扩展另外打包了这些项目。

涉及语法、诊断或 LSP 时，按 README 和 `LSP.md` 做实际编辑器验证，并说明所用 Xu 编译器版本。仅治理文件修订时检查文档、链接、表单、模板一致性与打包排除规则即可。

## 提交 PR

说明用户可见变化、复现或使用步骤、编辑器与 SDK 环境、扩展版本、验证结果和回滚方法。源码提交不包含 VSIX、`node_modules/` 或 `dist/`；不把编译器和历史引导二进制打入扩展。
