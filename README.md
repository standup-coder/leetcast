# 🎙️ LeetCast

[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**LeetCast** 是一个创新的开发者工具，它将 LeetCode 题目转化为高质量的语音播报（Podcast）。通过集成 OpenAI 的智能分析和 ElevenLabs 的顶尖语音合成技术，让你可以随时随地“听”题，利用碎片时间深化对算法和数据结构的理解。

---

## ✨ 核心特性

- 🎧 **算法播报**：将复杂的算法题目转化为自然、易听的播报内容。
- 🤖 **AI 深度解析**：利用 OpenAI GPT 模型生成题目的核心思路、关键点和解题策略。
- 🔊 **顶尖音质**：集成 ElevenLabs API，提供多语种、多情感的高仿真人声。
- 🔍 **海量题库**：支持通过 LeetCode GraphQL API 实时获取或从本地缓存加载 Top 100 热门题目。
- 🛠️ **多模式支持**：
  - **CLI 模式**：命令行交互，快速查找并生成播报。
  - **MCP Server**：集成到 AI 助手（如 Claude/Cursor），让 AI 随时为你播报题目。
- 💾 **本地缓存**：完善的题目缓存机制，支持离线搜索和快速访问。

---

## 🚀 快速开始

### 前置要求

- **Node.js**: v18.0.0 或更高版本
- **Package Manager**: npm (随 Node.js 安装)
- **API Keys**:
  - [OpenAI API Key](https://platform.openai.com/)
  - [ElevenLabs API Key](https://elevenlabs.io/)

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/your-username/leetcast.git
   cd leetcast
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   复制 `.env.example` 并重命名为 `.env`，填入你的 API 密钥：
   ```bash
   cp .env.example .env
   ```
   编辑 `.env`:
   ```env
   OPENAI_API_KEY=your_openai_key
   ELEVENLABS_API_KEY=your_elevenlabs_key
   # 可选：配置默认保存路径
   DOWNLOAD_DIR=./downloads
   ```

4. **初始化题库缓存**
   运行以下脚本从 LeetCode 获取 Top 100 热门题目：
   ```bash
   npm run update-problems
   ```

---

## 🛠️ 使用方法

### 1. 命令行交互 (CLI)

运行交互式控制台，搜索题目并生成播报：
```bash
npm run dev
```

### 2. 作为 MCP Server 使用

在 `cursor` 或 `claude` 的配置文件中添加以下配置：

```json
{
  "mjs-servers": {
    "leetcast": {
      "command": "npx",
      "args": ["-y", "ts-node", "/absolute/path/to/leetcast/src/mcp-server.ts"]
    }
  }
}
```

### 3. 更新本地题库

随时更新最新的热门题目：
```bash
npm run update-problems
```

---

## 🏗️ 项目架构

```text
src/
├── services/
│   ├── leetcode.ts        # 题库管理服务
│   ├── graphql-client.ts  # LeetCode API 客户端
│   ├── audio.ts           # 音频生成与合成服务
│   └── mcp.ts             # MCP 协议实现
├── utils/
│   ├── cache-manager.ts   # 本地缓存管理
│   └── retry-utils.ts     # 网络重试机制
├── scripts/
│   └── update-problems.ts # 题库更新脚本
└── cli.ts                 # CLI 交互入口
```

---

## 📈 路线图

- [x] LeetCode GraphQL API 集成
- [x] 本地缓存机制
- [ ] 支持按标签（Tag）和公司（Company）分类获取
- [ ] 增加更多语音角色选择
- [ ] 支持中文播报优化
- [ ] 提供 Web 预览界面

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！无论是提交 Bug 反馈、建议新功能，还是直接贡献代码，请随时开启 Issue 或提交 Pull Request。

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

---

**LeetCast** - 让算法学习更简单、更高效。
