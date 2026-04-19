import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  exchangeCodeForToken,
  isAllowedShop,
  safeStateCompare,
  verifyOAuthHmac,
} from "@/lib/shopify/oauth";
import { STATE_COOKIE } from "../install/route";

const ADMIN_API_VERSION = "2026-04";

interface StorefrontAccessTokenCreateResponse {
  data?: {
    storefrontAccessTokenCreate?: {
      storefrontAccessToken?: {
        accessToken: string;
        title: string;
      } | null;
      userErrors: Array<{ field: string[] | null; message: string }>;
    };
  };
  errors?: Array<{ message: string }>;
}

async function createStorefrontToken(
  shop: string,
  adminToken: string,
): Promise<{ token: string | null; error: string | null }> {
  const query = `mutation storefrontAccessTokenCreate($input: StorefrontAccessTokenInput!) {
  storefrontAccessTokenCreate(input: $input) {
    storefrontAccessToken { accessToken title }
    userErrors { field message }
  }
}`;

  const response = await fetch(
    `https://${shop}/admin/api/${ADMIN_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": adminToken,
      },
      body: JSON.stringify({
        query,
        variables: { input: { title: "jewelry-diy-frontend" } },
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return { token: null, error: `HTTP ${response.status}` };
  }

  const payload = (await response.json()) as StorefrontAccessTokenCreateResponse;

  if (payload.errors?.length) {
    return { token: null, error: payload.errors[0].message };
  }

  const result = payload.data?.storefrontAccessTokenCreate;
  if (result?.userErrors?.length) {
    return { token: null, error: result.userErrors[0].message };
  }

  const token = result?.storefrontAccessToken?.accessToken ?? null;
  return { token, error: token ? null : "Token missing in response" };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderTokenPage(args: {
  shop: string;
  adminToken: string;
  storefrontToken: string | null;
  storefrontError: string | null;
  grantedScopes: string;
}): string {
  const adminEsc = escapeHtml(args.adminToken);
  const storefrontEsc = args.storefrontToken
    ? escapeHtml(args.storefrontToken)
    : "";
  const shopEsc = escapeHtml(args.shop);
  const scopesEsc = escapeHtml(args.grantedScopes);
  const storefrontSection = args.storefrontToken
    ? `
    <section>
      <h2>Storefront API access token</h2>
      <p>把这个值粘贴到 Vercel 的 <code>SHOPIFY_STOREFRONT_TOKEN</code>。</p>
      <div class="token" id="storefront">${storefrontEsc}</div>
      <button type="button" data-target="storefront">复制</button>
    </section>`
    : `
    <section>
      <h2>Storefront API access token</h2>
      <p class="error">自动创建失败：${escapeHtml(args.storefrontError ?? "未知错误")}。稍后手动在 Admin API 运行 <code>storefrontAccessTokenCreate</code> mutation 补一个。</p>
    </section>`;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<title>Shopify 安装完成</title>
<meta name="robots" content="noindex" />
<style>
  :root { color-scheme: light; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 720px; margin: 2rem auto; padding: 0 1rem; color: #1E2430; line-height: 1.6; }
  h1 { font-size: 1.5rem; }
  h2 { font-size: 1.1rem; margin-top: 1.75rem; }
  code { background: #F1F2F5; padding: 0.1em 0.35em; border-radius: 4px; font-size: 0.9em; }
  .token { background: #0F1216; color: #E3E5EA; padding: 0.75rem 1rem; border-radius: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.85rem; word-break: break-all; margin: 0.5rem 0; }
  button { background: #1E2430; color: white; border: 0; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.9rem; }
  button:hover { background: #2A3140; }
  .shop { color: #596170; font-size: 0.9rem; }
  .warn { background: #FFF4E5; border: 1px solid #F2C26B; padding: 0.75rem 1rem; border-radius: 8px; margin: 1rem 0; font-size: 0.9rem; }
  .error { color: #B42318; }
  ol { padding-left: 1.25rem; }
</style>
</head>
<body>
  <h1>Shopify 安装完成 ✓</h1>
  <p class="shop">店铺：<code>${shopEsc}</code></p>
  <p class="shop">授权 scope：<code>${scopesEsc}</code></p>

  <div class="warn">
    这两个 token 是敏感凭据——只在本窗口复制粘贴到 Vercel 环境变量，别发到聊天、截图或 Git。
  </div>

  <section>
    <h2>Admin API access token</h2>
    <p>把这个值粘贴到 Vercel 的 <code>SHOPIFY_ADMIN_TOKEN</code>。</p>
    <div class="token" id="admin">${adminEsc}</div>
    <button type="button" data-target="admin">复制</button>
  </section>
  ${storefrontSection}

  <h2>下一步</h2>
  <ol>
    <li>到 Vercel → jewelry-diy → Settings → Environment Variables，把上面两个 token 粘好。</li>
    <li>在 Deployments 页对最新部署 Redeploy（取消 Use existing Build Cache）。</li>
    <li>无痕窗口打开 <code>/builder</code> 验证。</li>
  </ol>

<script>
  document.querySelectorAll('button[data-target]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = document.getElementById(btn.getAttribute('data-target'));
      if (!target) return;
      navigator.clipboard.writeText(target.textContent || '').then(function () {
        var original = btn.textContent;
        btn.textContent = '已复制';
        setTimeout(function () { btn.textContent = original; }, 1500);
      });
    });
  });
</script>
</body>
</html>`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = url.searchParams;
  const shop = params.get("shop");
  const code = params.get("code");
  const state = params.get("state");

  if (!isAllowedShop(shop)) {
    return NextResponse.json(
      { error: "Shop is not allowed." },
      { status: 400 },
    );
  }

  if (!code || !state) {
    return NextResponse.json(
      { error: "Missing code or state." },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get(STATE_COOKIE)?.value;
  if (!savedState || !safeStateCompare(savedState, state)) {
    return NextResponse.json(
      { error: "Invalid OAuth state." },
      { status: 400 },
    );
  }
  cookieStore.set(STATE_COOKIE, "", { maxAge: 0, path: "/api/shopify" });

  const clientId = process.env.SHOPIFY_APP_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_APP_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Missing SHOPIFY_APP_CLIENT_ID or SHOPIFY_APP_CLIENT_SECRET." },
      { status: 500 },
    );
  }

  if (!verifyOAuthHmac(params, clientSecret)) {
    return NextResponse.json(
      { error: "Invalid HMAC signature." },
      { status: 401 },
    );
  }

  let tokenResult;
  try {
    tokenResult = await exchangeCodeForToken({
      shop,
      code,
      clientId,
      clientSecret,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return NextResponse.json(
      { error: `Token exchange failed: ${message}` },
      { status: 502 },
    );
  }

  const { token: storefrontToken, error: storefrontError } =
    await createStorefrontToken(shop, tokenResult.access_token);

  const html = renderTokenPage({
    shop,
    adminToken: tokenResult.access_token,
    storefrontToken,
    storefrontError,
    grantedScopes: tokenResult.scope,
  });

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
    },
  });
}
