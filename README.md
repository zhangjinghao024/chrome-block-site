# Block Site — Chrome Extension

一个简洁高效的 Chrome 扩展，帮助你屏蔽令人分心的网站，保持专注。

## 功能特性

- **一键屏蔽**：点击工具栏图标，一键屏蔽当前网站
- **手动添加**：支持手动输入域名添加到屏蔽列表
- **跨设备同步**：屏蔽列表通过 Chrome 账号自动同步
- **成人内容过滤**：内置成人网站规则库，可一键开启（Layer 1 - DNS 级别拦截）
- **NSFW 图片过滤**：基于设备端 AI（NSFWJS）识别并模糊成人图片（Layer 2 - ML 级别，开发中）
- **管理页面**：完整的屏蔽列表管理界面，支持添加、删除操作

## 安装方法

1. 下载或克隆本仓库
   ```bash
   git clone https://github.com/zhangjinghao024/chrome-block-site.git
   ```
2. 打开 Chrome，进入 `chrome://extensions/`
3. 开启右上角「开发者模式」
4. 点击「加载已解压的扩展程序」，选择项目根目录
5. 扩展图标出现在工具栏后即安装成功

## 使用说明

### 屏蔽网站
- 访问想要屏蔽的网站，点击扩展图标，点击「Block Current Site」
- 或在输入框中手动输入域名（如 `twitter.com`），点击「Add」

### 管理屏蔽列表
- 点击 popup 中的「Manage list」链接，进入完整管理页面
- 在管理页面可查看所有已屏蔽网站并删除任意条目

### 内容过滤
- **Block adult sites**：开启后屏蔽已知成人网站（基于内置规则）
- **Filter NSFW images**：开启后在任意页面模糊 NSFW 图片（功能开发中）

## 项目结构

```
block-site-extension/
├── manifest.json          # 扩展配置（MV3）
├── background.js          # Service Worker：规则管理、消息处理
├── rules.json             # 动态屏蔽规则（用户自定义）
├── adult-rules.json       # 内置成人网站规则
├── popup/                 # 工具栏弹出窗口
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── options/               # 管理页面
│   ├── options.html
│   ├── options.js
│   └── options.css
├── blocked/               # 拦截后的跳转页面
│   ├── blocked.html
│   ├── blocked.js
│   └── blocked.css
├── content/               # 内容脚本（NSFW 图片过滤）
│   ├── content.js
│   └── content.css
├── lib/                   # 第三方库（TensorFlow.js、NSFWJS）
└── icons/                 # 扩展图标
```

## 技术说明

- 基于 **Manifest V3** 开发，符合 Chrome 最新扩展规范
- 使用 `declarativeNetRequest` API 实现网络请求拦截，性能高效
- 屏蔽列表存储于 `chrome.storage.sync`，支持多设备同步
- 严格遵循 MV3 CSP 策略，所有脚本均为外部文件引用

## 权限说明

| 权限 | 用途 |
|------|------|
| `declarativeNetRequest` | 拦截并重定向被屏蔽网站的请求 |
| `storage` | 保存屏蔽列表和用户设置 |
| `tabs` | 获取当前标签页 URL |
| `host_permissions: <all_urls>` | 对所有网站应用屏蔽规则 |

## License

MIT
