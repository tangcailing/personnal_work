# 个人工作台 Personal Workspace

> 一个功能强大的个人效率管理工作台，集成时间管理、财务记录、健康追踪、学习工具等多功能模块。

## ✨ 功能特性

### 📋 核心模块（12大功能）

1. **⏰ 番茄钟计时器** - 专注时间管理，提升工作效率
2. **💰 财务管理** - 收支记录与可视化图表分析（Chart.js）
3. **⚖️ 体重记录** - 健康数据追踪
4. **💪 减脂塑形管理** - 运动与饮食计划
5. **📚 英文单词学习** - 自动查词（Free Dictionary API）+ 6大分类系统
6. **📋 工作计划区** - 任务清单与进度管理
7. **📱 自媒体运营** - 内容创作与发布管理
8. **💭 今日感悟与进步** - 个人成长记录
9. **📊 数据统计看板** - 全局数据可视化
10. **📖 表达训练模块** - 沟通能力提升
11. **🤖 AI助手** - 智能辅助工具

### 🎨 设计特色

- **紫色优雅配色系统**
  - 主色：`#8B5CF6` 紫罗兰
  - 浅紫：`#A78BFA` 悬停态
  - 深紫：`#7C3AED` 激活态
  
- **护眼体验** - 精心调配的色彩对比度
- **单文件应用** - 无需安装，开箱即用
- **多用户支持** - localStorage 数据隔离
- **响应式设计** - 适配不同屏幕尺寸

## 🚀 快速开始

### 安装使用

1. **下载文件**
   ```bash
   git clone https://gitee.com/cailingtang/ai-portfolio.git
   cd ai-portfolio/personal-workspace
   ```

2. **直接打开**
   - 双击 `index-complete.html` 即可在浏览器中使用
   - 或者创建桌面快捷方式

3. **无需服务器** - 纯前端应用，所有数据存储在浏览器本地

### 系统要求

- 现代浏览器（Chrome / Edge / Firefox 等）
- 支持 localStorage 和 ES6+
- 建议屏幕分辨率 ≥ 1366x768

## 📦 技术栈

- **前端框架**：原生 JavaScript (ES6+)
- **样式**：CSS3 + Flexbox/Grid
- **图表库**：Chart.js (CDN)
- **字体**：Inter 字体系统
- **数据存储**：localStorage
- **API**：Free Dictionary API（单词查询）

## 📂 项目结构

```
personal-workspace/
├── index-complete.html      # 主应用文件（单文件包含所有功能）
├── Workspace.lnk            # 桌面快捷方式
├── test-time.html           # 时间功能测试文件
├── workspace-icon.svg       # 图标资源
└── README.md                # 项目说明
```

## 🎯 功能演示

### 番茄钟计时器
专注工作 25 分钟，休息 5 分钟，科学管理时间。

### 财务管理
- 收入/支出分类记录
- 月度/年度图表分析
- 预算管理与提醒

### 英文单词学习
- 🔍 一键查词（支持 Enter 快捷键）
- 6 大分类：学术/文学/GRE/专业/日常/商务
- 词义、音标、例句自动获取

## 🔧 开发说明

### 数据存储格式

所有数据存储在 `localStorage` 的 `workbench_complete_data` 键中：

```javascript
{
  tasks: [],           // 任务列表
  finances: [],        // 财务记录
  weights: [],         // 体重记录
  words: [],           // 单词本
  settings: {},        // 用户设置
  // ... 其他模块数据
}
```

### 自定义配色

修改 CSS 变量即可更换主题色：

```css
:root {
  --primary-purple: #8B5CF6;
  --hover-purple: #A78BFA;
  --active-purple: #7C3AED;
}
```

## 📝 更新日志

### v3.0.1 (2026-08-18)
- ✅ 修复时间显示问题（task.text 容错处理）
- ✅ 移除"清空所有数据"按钮
- ✅ 优化启动流程错误处理
- ✅ 添加 Chart.js 加载检测

### v3.0.0 (2026-08)
- ✅ 应用紫色优雅配色系统
- ✅ 完善英文单词学习模块
- ✅ 添加自动查词功能
- ✅ 修复任务删除类型匹配问题
- ✅ 优化多用户数据管理

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

MIT License - 自由使用、修改和分发

## 👤 作者

**cailingtang**

- Gitee: [@cailingtang](https://gitee.com/cailingtang)
- 项目: [ai-portfolio](https://gitee.com/cailingtang/ai-portfolio)

## 🙏 致谢

- Chart.js 团队提供的优秀图表库
- Free Dictionary API 提供免费词典服务
- 所有使用者的反馈与建议

---

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！