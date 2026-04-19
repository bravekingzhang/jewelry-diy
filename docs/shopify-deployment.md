# Jewelry DIY · Shopify 生产部署（Vercel）

本文对应仓库内的 Next.js 应用与 Shopify 店铺的对接方式：**定制站独立托管**，通过 API 与 `*.myshopify.com` 通信；主域名 `lilpeb.com` 仍由 Shopify 在线商店与结账使用。

## 1. Vercel 托管

1. 将本仓库推送到 GitHub / GitLab / Bitbucket。
2. 打开 [Vercel](https://vercel.com)，**Add New Project**，导入该仓库。
3. Framework Preset 选 **Next.js**（与根目录 [vercel.json](../vercel.json) 一致即可）。
4. **Environment Variables**：按下文「环境变量」表逐条添加（Production；Preview 可填相同或测试店）。
5. 首次 **Deploy**。部署成功后记下生产 URL，例如 `https://jewelry-diy.vercel.app`。

### 自定义子域名（推荐）

在阿里云 DNS 为 **子域名** 增加 CNAME（不要改动已指向 Shopify 的根域 `@` 与 `www`）：

| 记录类型 | 主机记录 | 记录值 |
|---------|----------|--------|
| CNAME | `diy`（或 `app`） | Vercel 项目域名给出的 target（如 `cname.vercel-dns.com`） |

在 Vercel 项目 **Settings → Domains** 中添加 `diy.lilpeb.com`，按提示完成校验。

顾客入口示例：`https://diy.lilpeb.com/builder`。

## 2. 环境变量

复制 [.env.example](../.env.example) 为本地 `.env.local`；在 Vercel 中填入 **同名** 变量。

| 变量 | 阶段 | 说明 |
|------|------|------|
| `SHOPIFY_DOMAIN` | 部署前 | 填 **`你的店铺.myshopify.com`**，勿用自定义域作主配置。OAuth 白名单、Admin/Storefront client 都读它。 |
| `SHOPIFY_APP_CLIENT_ID` | 部署前 | Dev Dashboard → 设置 → 客户端 ID。 |
| `SHOPIFY_APP_CLIENT_SECRET` | 部署前 | Dev Dashboard → 设置 → 加密密钥。仅服务端使用。 |
| `SHOPIFY_APP_SCOPES` | 部署前 | 逗号分隔的 Admin API scope，与 Dev Dashboard 版本 Required scopes 保持一致。 |
| `SHOPIFY_ADMIN_TOKEN` | OAuth 安装后 | 回调页展示的 Admin API access token（形如 `shpat_*`）。 |
| `SHOPIFY_STOREFRONT_TOKEN` | OAuth 安装后 | 回调页展示的 Storefront access token。 |
| `SHOPIFY_WEBHOOK_SECRET` | Webhook 配置后 | Shopify 后台 Webhook 签名密钥，用于 [webhooks 路由](../src/app/api/shopify/webhooks/route.ts) 验签。 |
| `REVALIDATE_SECRET` | 可选 | 调用 `POST /api/revalidate` 的 JSON body.secret 校验值；不用可留空。 |

**全部变量都是服务端使用**，不要给任何一项加 `NEXT_PUBLIC_` 前缀。

微信、管理员相关变量见 `.env.example`，仅在使用 `/admin` 管理页时配置。

## 3. 首次安装 Shopify 应用（OAuth）

Shopify 新版 Dev Dashboard 不再直接显示长期 token，必须走 OAuth 授权码流程。本仓库在 [src/app/api/shopify/install/route.ts](../src/app/api/shopify/install/route.ts) 和 [src/app/api/shopify/callback/route.ts](../src/app/api/shopify/callback/route.ts) 实现了完整回调。

### 3.1 Dev Dashboard 配置

在 `https://dev.shopify.com` 打开应用 → **版本** → 创建新版本或编辑现有版本：

- **应用 URL**：`https://diy.lilpeb.com`
- **取消勾选** 在 Shopify 后台中嵌入应用（本项目是独立站，不走 App Bridge）
- **权限范围**（Required）：与 `SHOPIFY_APP_SCOPES` 保持一致 + 所需 `unauthenticated_*` storefront scope
- **重定向 URL**：`https://diy.lilpeb.com/api/shopify/callback`
- **使用旧版安装流程**：**不勾**（officially deprecated）

发布版本。

### 3.2 在 Vercel 填前置环境变量

至少把 `SHOPIFY_DOMAIN`、`SHOPIFY_APP_CLIENT_ID`、`SHOPIFY_APP_CLIENT_SECRET`、`SHOPIFY_APP_SCOPES` 填好并 Redeploy。

### 3.3 触发安装

如果店铺里已经装过旧版本，先到 `admin.shopify.com/store/<store>/settings/apps` 把应用卸载。然后浏览器打开：

```
https://diy.lilpeb.com/api/shopify/install?shop=<你的店铺>.myshopify.com
```

授权完成后会跳回 `/api/shopify/callback` 并展示 **Admin token** 与 **Storefront token**。

### 3.4 把 token 写回 Vercel

把两个 token 分别填到 `SHOPIFY_ADMIN_TOKEN` 和 `SHOPIFY_STOREFRONT_TOKEN`，再次 Redeploy。

### 3.5 token 失效或轮换

重新走 3.3 即可重新生成，旧的会继续有效直到卸载应用。

## 4. 上线自检

- [ ] `npm run build` 在本地或通过 Vercel 构建成功。
- [ ] 生产环境打开 `/builder`，选珠 → 结账 → 跳转 Shopify Checkout 正常。
- [ ] Webhook：在 Shopify 发送测试事件，响应 200，且无验签失败日志（见 [shopify-admin-setup.md](./shopify-admin-setup.md)）。
- [ ] 若密钥曾在聊天或截图中泄露，已在 Shopify **轮换** 并只写入 Vercel 环境变量（见 [shopify-security.md](./shopify-security.md)）。

## 5. 相关文档

- [主题菜单入口](./shopify-theme-entry.md)
- [Shopify 后台：Metafields、Scope、Webhook](./shopify-admin-setup.md)
- [密钥与安全](./shopify-security.md)
