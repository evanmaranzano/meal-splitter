# 聚餐账单拆分工具 MVP

**在线体验：[https://meal-splitter.cenghaoyu28.workers.dev/](https://meal-splitter.cenghaoyu28.workers.dev/)**

一个可部署到 Cloudflare Pages 的纯前端 SPA，用于餐厅聚餐后快速录入参与人、菜品、服务费、小费、优惠和抹零，并计算每个人应付金额。

## 功能

- 参与人添加、改名、删除，姓名为空或重复时提示。
- 菜品/账单项目添加、编辑、删除，支持单人承担、多人平分、所有人平分快捷选择。
- 附加费用：税费、服务费、小费、固定金额优惠、百分比优惠、抹零/调整金额。
- 费用按每个人菜品小计比例分摊，金额计算使用“分”为单位的整数。
- 结算结果展示最终总额、每人应付、菜品小计、附加费用分摊和项目明细。
- 一键复制纯文本结算结果。
- 使用 localStorage 保存当前账单，刷新页面后数据不丢失。
- 提供“清空当前账单”按钮，清空前二次确认。

## 技术栈

- Vite
- React
- TypeScript
- Vitest
- localStorage

## 本地运行

```bash
npm install
npm run dev
```

开发服务器启动后，按终端输出的本地地址在浏览器打开。

## 测试

```bash
npm test
```

核心计算逻辑的单元测试覆盖：

- 单人承担项目
- 多人平分项目
- 某人不参与某项目
- 税费、服务费、小费按比例分摊
- 固定金额优惠
- 百分比优惠
- 正负调整金额
- 四舍五入误差
- 所有人总额等于最终账单总额

## 构建

```bash
npm run build
```

构建产物输出到 `dist/`。

## Cloudflare Pages 部署

1. 将项目推送到 GitHub、GitLab 或其他 Cloudflare Pages 支持的 Git 仓库。
2. 在 Cloudflare Dashboard 中进入 **Workers & Pages**。
3. 选择 **Create application** → **Pages** → 连接仓库。
4. 配置构建参数：
   - Build command: `npm run build`
   - Output directory: `dist`
5. 保存并部署。

本项目是纯前端 SPA，不需要后端、数据库、登录、支付或环境变量。
