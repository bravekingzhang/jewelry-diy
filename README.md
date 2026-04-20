# Jewelry DIY · 定制珠宝平台

移动端优先的定制手串 DIY 应用。架构：**独立站 Next.js 16（部署在 Vercel）+ Shopify 后端（Headless）**——两端通过 OAuth 授权码安装对接，Storefront API 拉商品/建 cart，Admin API 写管理数据，Webhook 同步变更。

## 已实现

- `/builder`：DIY 手串配置器（圆环预览、分类筛选、搜索、选珠/删珠、实时总价、一键下单）
- `/api/shopify/cart`：Storefront API 创建 cart，返回 Shopify `checkoutUrl` 供客户端跳转
- `/api/shopify/install` + `/api/shopify/callback`：OAuth 授权码安装流程（shop 白名单 + state CSRF + HMAC 校验 + `storefrontAccessTokenCreate` mutation + 一次性 token 展示页）
- `/api/shopify/webhooks`：Webhook 验签（base64 HMAC + `timingSafeEqual`）后 `revalidatePath`
- `/admin/beads`：Admin API 珠子管理（需 WeChat OAuth 或本地 `DEV_ADMIN_OPENID` 绕过）
- `/api/revalidate`：手动 ISR 触发（带 `REVALIDATE_SECRET` 校验）

## 本地启动

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

- 如果 `.env` 里 `SHOPIFY_DOMAIN` + `SHOPIFY_STOREFRONT_TOKEN` 任一为空，`/builder` 会用 `src/lib/mock/beads.ts` 的演示数据；
- 两个都配齐时，直接从 Shopify Storefront API 拉真实数据。**空数组不再回落到 mock**（避免假数据送进真实 checkout）。

## 环境变量（按填入阶段）

详细说明见 `.env.example` 内注释，详细流程见 [docs/shopify-deployment.md](docs/shopify-deployment.md)。

**阶段 1 · 部署前必填**

```
SHOPIFY_DOMAIN
SHOPIFY_APP_CLIENT_ID
SHOPIFY_APP_CLIENT_SECRET
SHOPIFY_APP_SCOPES
```

**阶段 2 · OAuth 安装后从回调页复制**

```
SHOPIFY_ADMIN_TOKEN
SHOPIFY_STOREFRONT_TOKEN
```

**阶段 3 · Webhook 创建后**

```
SHOPIFY_WEBHOOK_SECRET
```

**可选**：`REVALIDATE_SECRET`、`WECHAT_APPID`、`WECHAT_SECRET`、`ADMIN_OPENIDS`、`DEV_ADMIN_OPENID`。

> 全部变量都是服务端使用，不需要任何 `NEXT_PUBLIC_*` 前缀——客户端只调 `/api/shopify/*` 这类自家路由，token 不离开服务端。

## 生产部署（Shopify + Vercel）

### 首次安装流程

1. Shopify Dev Dashboard 建应用，发布版本，重定向 URL 填 `https://<你的域>/api/shopify/callback`。
2. Vercel 填阶段 1 的 4 个 env → Redeploy。
3. 浏览器打开 `https://<你的域>/api/shopify/install?shop=<你的店>.myshopify.com` → Shopify 授权 → 回到我们自己的回调页。
4. 从回调页把 Admin token、Storefront token 复制回 Vercel（阶段 2）→ Redeploy。
5. Shopify 后台配 Webhook 指到 `/api/shopify/webhooks`，签名密钥回填阶段 3 → Redeploy。

### 配套文档

- [docs/shopify-deployment.md](docs/shopify-deployment.md)：完整部署、环境变量、OAuth 装机流程
- [docs/shopify-admin-setup.md](docs/shopify-admin-setup.md)：Scope、Metafields、Webhook 后台配置
- [docs/shopify-theme-entry.md](docs/shopify-theme-entry.md)：主题菜单入口
- [docs/shopify-security.md](docs/shopify-security.md)：密钥与安全

根目录 [vercel.json](vercel.json) 供 Vercel 使用；上线前在本地或 CI 执行 `npm run build` 确认构建通过。

## 关键目录

- `src/app/builder/page.tsx` —— DIY 页
- `src/app/admin/beads/*` —— 珠子管理
- `src/components/bracelet-builder/*` —— 配置器组件
- `src/lib/shopify/client.ts`、`admin-client.ts` —— Storefront / Admin GraphQL client
- `src/lib/shopify/oauth.ts` —— OAuth 工具（HMAC、state、code exchange、shop 白名单）
- `src/app/api/shopify/install/route.ts`、`callback/route.ts` —— OAuth 安装 + 回调
- `src/app/api/shopify/cart/route.ts` —— cart 创建代理
- `src/app/api/shopify/webhooks/route.ts` —— Webhook 验签 + 缓存刷新

## 下一步建议

1. 扩展珠子 metafield 定义（纹理 3D 贴图、动态定价规则等）
2. 增加 Playwright 移动端冒烟测试（选珠 → 结账按钮可用 → checkoutUrl 有效）
3. 管理后台上生产前配置 `WECHAT_APPID` / `WECHAT_SECRET` / `ADMIN_OPENIDS`

## 相关阅读

[article.md](article.md) —— Next.js + Shopify 对接完整实战记录（适合公众号发布）
