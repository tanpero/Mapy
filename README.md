<div align="center">

![Mapy Logo](./logo.png)

# Mapy

*关注思考过程的笔记工具*

🚧 Working In Progress.

</div>



## Usage

- 启动：
  ```bash
  git clone https://github.com/tanpero/Mapy.git
  cd Mapy
  npm install
  npm start
  ```

- 构建：

```bash
git clone https://github.com/tanpero/Mapy.git
cd Mapy
npm install
npm run dist
```

## Goals

- 流畅的全功能笔记编辑体验
- 开箱即用的高质量文档排版方案


## Keymap

<div align="center">

|  Name   | Key  |
| ------- | ---- |
| 新建文件 | C-n |
| 打开文件 | C-o |
| 保存文件 | 自动 |
| 导出HTML | C-s |

</div>

## Available Syntax:
- [x] 标准Markdown语法
- [x] 行内公式和公式块
- [x] 待办清单
- [x] 展开与折叠信息

## Roadmap

- [x] 基本的 Markdown 实时预览
- [x] 在编辑时实时呈现当前文本词云
- [x] 实时保存（持续编辑时每五秒保存一次）
- [x] 生成格式化的 HTML 文件
- [x] 支持内联代码和行间代码块的高亮、行号和自动缩进
- [x] 支持内联公式和行间公式块的渲染
- [x] 词云（由于外部依赖项自身的不可调试的问题，暂时从界面上移除）
- [x] 按日统计的写作频率热力图（已经实现内部逻辑，尚未接入用户界面）
- [x] 将实时预览生成为 PDF 文件（快捷键为 `Ctrl P`）
  > 由于本人尚未研究清楚 jsPDF 这个库的正确使用方式，现在虽然能生成 PDF，但是格式混乱
- [ ] 图表绘制  
  > 使用 PlantUML 和 Mermaid
- [ ] 对于不同规模的文本，实现相对美观和一致的词云呈现外观
- [x] 当链接被单击时，在默认浏览器打开
- [ ] 支持内容查找替换
- [x] 美化实时预览内容及 HTML 文件的显示风格
- [ ] 支持拖拽导入图片和 Markdown 文件
- [ ] 添加丰富的格式快捷键
- [ ] 实现预览区和编辑区的同步滚动
- [ ] 交互思路由“面向文件”转为“面向笔记”，弱化文件的存在
- [ ] 重构用户界面，使用更合理的方式呈现词云，笔记以 `tab` 页显示
- [ ] 实现笔记管理功能，支持分类和添加标签
- [ ] 正确呈现按日统计的写作频率热力图和笔记词云
- [ ] 正确生成 PDF
- [ ] 实现界面主题外观
- [ ] 支持根据笔记分类、标题和内部链接生成知识图谱，并根据知识图谱追溯笔记
- [ ] 支持使用 `AsciiDoc`、`reStructureText`、`Org-Mode` 和 `Textile` 等标记格式编写笔记
- [ ] 支持实时协同操作（基于 `Y.js`）
- [ ] 实现写作任务规划，统计写作时长、写作进度
- [ ] 追踪笔记更新和查阅情况
- [ ] 为摘抄、资料归档、头脑风暴等应用场景提供更完善友好的支持
- [ ] 笔记可复制为微信公众号、知乎、简书、掘金、Lofter 等平台编辑器直接可用的格式
- [ ] 笔记可整合为幻灯片（基于 `Reveal.js`）
- [ ] 笔记可拆分为记忆卡片

## THANKS


目前为止，Mapy 的实现基于下列重要的项目。

感谢开源作者们的出色工作！

::: center

| 名称        | 作者                                |
| ----------- | ----------------------------------- |
| **Electron**    | 赵成 *(中国，杭州)*                   |
| **CodeMirror**  | Marijn Haverbeke *(German, Berlin)*   |
| **Markdown-It** | Vitaly Puzrin *(Israel, Nof haGalil)* |
| **KaTeX**       | Khan Academy                          |
| **HighlightJS** | Ivan Sagalaev *(USA, Sammamish)*      |
| **D3**          | Mike Bostock *(USA, San Francisco)*   |
| **jsPDF**       | James Hall *(UK, Leeds)*              |

:::

## [LICENSE](./LICENSE)

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.