# Mapy：关注思考过程的笔记工具

---

目前功能极其简陋，处于早期活跃开发阶段，仅有最基本的可用性，交互方式亟待重大改进。

## 使用方式

启动应用：

```bash
git clone https://github.com/tanpero/Mapy.git
cd Mapy
npm install
npm start
```

新建文件：快捷键 `Ctrl N`

打开文件：快捷键 `Ctrl O`

保存文件：自动

保存 HTML：快捷键 `Ctrl S`

构建应用：

```bash
git clone https://github.com/tanpero/Mapy.git
cd Mapy
npm install
npm run dist
```

## 已有特性

- 基本的 Markdown 实时预览

- 在编辑时实时呈现当前文本词云

- 实时保存（持续编辑时每五秒保存一次）

- 生成格式化的 HTML 文件

- 支持内联代码和行间代码块的高亮、行号和自动缩进

- 支持内联公式和行间公式块的渲染

- 词云（由于外部依赖项自身的不可调试的问题，暂时从界面上移除）

- 按日统计的写作频率热力图（已经实现内部逻辑，尚未接入用户界面）

- 将实时预览生成为 PDF 文件（快捷键为 `Ctrl P`）

  **Note**

  由于本人尚未研究清楚 jsPDF 这个库的正确使用方式，现在虽然能生成 PDF，但是格式混乱

  

其中已支持的 Markdown 语法包括：

多级标题、粗体、斜体、下划线、删除线、上下标、高亮、文字上方附注（拼音）、图片、链接、有序/无序列表、emoji shortcuts、扩展和简化的表格语法、脚注、目录、行内公式和公式块、行内代码和代码块、待办清单

已引入图表绘制框架 PlantUML 和 Mermaid，但同样因为尚未解决的非逻辑性问题，暂时无法提供显示支持，将尽快修复！

如果您对于界面设计、 jsPDF 的使用有所研究，诚挚期待您的指导！

## 路线图

### 短期目标

- 对于不同规模的文本，实现相对美观和一致的词云呈现外观
- 当链接被单击时，在默认浏览器打开
- 美化实时预览内容及 HTML 文件的显示风格
- 支持拖拽导入图片和 Markdown 文件

### 中期目标

- 添加丰富的格式快捷键
- 实现预览区和编辑区的同步滚动
- 交互思路由“面向文件”转为“面向笔记”，弱化文件的存在
- 重构用户界面，使用更合理的方式呈现词云，笔记以 `tab` 页显示
- 实现笔记管理功能，支持分类和添加标签
- 正确呈现按日统计的写作频率热力图和笔记词云
- 正确生成 PDF
- 实现界面主题外观
- 支持根据笔记分类、标题和内部链接生成知识图谱，并根据知识图谱追溯笔记
- 支持使用 `AsciiDoc`、`reStructureText`、`Org-Mode` 和 `Textile` 等标记格式编写笔记

### 长期目标

- 实现写作任务规划，统计写作时长、写作进度
- 追踪笔记更新和查阅情况
- 为摘抄、资料归档、头脑风暴等应用场景提供更完善友好的支持
- 笔记可复制为微信公众号、知乎、简书、掘金、Lofter 等平台编辑器直接可用的格式
- 笔记可整合为幻灯片（基于 `Reveal.js`）

## 许可证

MPL