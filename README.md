# 指南 | AI 八字決策指引

使用者先寫下問題，再輸入出生日期、時間與性別。程式立即排出命盤，AI 以串流方式提供解讀；會員可保存、回顧及刪除歷史紀錄。

## 技術與分工

- Next.js 16 App Router、React、TypeScript、Tailwind CSS v4。
- lunar-typescript 負責排盤；前端即時顯示，伺服器重新計算，不信任前端命盤。
- Gemini 只接收結構化命盤與問題，負責文字解讀。
- Supabase 提供會員登入與歷史紀錄，RLS 限制使用者只能存取自己的資料。
- Upstash Redis 提供每分鐘限流及訪客／會員每日額度。
- next-intl 管理繁中與英文；Radix 元件提供互動基礎。

## 本機開發

```bash
pnpm install
cp .env.example .env.local
# 填入 GEMINI_API_KEY，其餘設定見 .env.example
pnpm dev
```

開啟 [http://localhost:3000](http://localhost:3000)。

| 環境變數                             | 用途                                        |
| ------------------------------------ | ------------------------------------------- |
| GEMINI_API_KEY                       | 解讀所需的 API key                          |
| GEMINI_MODEL                         | 預設 gemini-2.5-flash                       |
| NEXT_PUBLIC_SITE_URL                 | 正式網址，影響 canonical、sitemap、分享圖片 |
| NEXT_PUBLIC_SUPABASE_URL             | 選用的會員系統網址                          |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | 選用的 Supabase 公開 key，需與網址一起設定  |
| UPSTASH_REDIS_REST_URL               | 正式環境必填，Redis REST 網址               |
| UPSTASH_REDIS_REST_TOKEN             | 正式環境必填，Redis REST token              |
| ANON_DAILY_LIMIT                     | 訪客每日額度，預設 3                        |
| MEMBER_DAILY_LIMIT                   | 會員每日額度，預設 10                       |
| PER_MINUTE_LIMIT                     | 每 IP 每分鐘上限，預設 6                    |
| NEXT_PUBLIC_SENTRY_DSN               | 選用的錯誤監控                              |
| SENTRY_AUTH_TOKEN                    | 選用的建置時 source map 上傳憑證            |

環境變數由 [env.ts](env.ts) 驗證；所有憑證放在未追蹤的 `.env.local`，不提交到 Git。

## 會員系統

1. 建立 Supabase 專案。
2. 在 SQL Editor 執行 [supabase/schema.sql](supabase/schema.sql)。
3. 填入兩個 `NEXT_PUBLIC_SUPABASE_*` 變數後重啟。

會員功能未設定時會隱藏登入入口。登入狀態與登入視窗由 `AuthProvider` 共用；註冊後是否需要確認 Email 由 Supabase 設定決定。

## 額度與部署

| 身分 | 每日次數   | 計數方式          | 解讀保存           |
| ---- | ---------- | ----------------- | ------------------ |
| 訪客 | 3，可設定  | Redis，依 IP      | 不保存             |
| 會員 | 10，可設定 | Redis，依 user id | Supabase，自行刪除 |

- 每日額度以 **Asia/Taipei 日期**為界；Redis key 帶日期並在 48 小時後到期。
- Lua 在同一次操作內檢查並扣除額度，多個請求同時到達也不會突破上限。
- 額度在生成前扣除；通過檢查後的生成失敗、中斷或取消仍計次，避免反覆失敗請求繞過成本保護。輸入驗證失敗及每分鐘限流不扣每日額度。
- 刪除歷史紀錄不會恢復額度。額度與紀錄不再共用資料來源。
- 本機開發未設定 Redis 可用記憶體備援；正式環境缺少 Redis 設定或連線失敗時會拒絕解讀請求。
- 首次從舊版升級會使用新的每日計數 key，當天從新計數起算；不需要 Supabase schema migration。

部署到 Vercel 等平台前，設定 Gemini key、Upstash 兩個變數與正式網站網址。需要會員功能時再加入 Supabase 設定。API 最長執行時間為 60 秒。

## 品質檢查

```bash
pnpm lint
pnpm typecheck
pnpm format:check
pnpm test:run
pnpm build
pnpm playwright:install  # 首次執行才需要
pnpm test:e2e
```

E2E 使用 build 產物，在獨立的 3100 埠啟動 production server；埠被占用時可設定 `PLAYWRIGHT_PORT` 改用其他埠。先執行 `pnpm build`。測試固定日期、攔截 AI API，涵蓋完整表單、429 錯誤、語系切換與手機版面，不呼叫真實 Gemini 或扣除產品額度。

要驗證 Redis Lua 的並行行為，可使用獨立的本機 Docker 容器：

```powershell
docker run --detach --rm --name suan-ming-quota-test redis:7-alpine
$env:REDIS_TEST_CONTAINER = 'suan-ming-quota-test'
pnpm test:run
Remove-Item Env:REDIS_TEST_CONTAINER
docker stop suan-ming-quota-test
```

沒有設定 `REDIS_TEST_CONTAINER` 時，兩個 Redis 整合測試會跳過；其餘單元／元件測試照常執行。整合測試不連線產品 Redis。

## 專案導覽

- [docs/architecture.md](docs/architecture.md)：畫面、資料流程與邊界。
- [docs/code-style.md](docs/code-style.md)：命名、樣式、測試規範。
- `components/`：產品元件；`components/ui/`：基礎互動元件。
- `hooks/`：登入、歷史查詢、多步驟表單與串流。
- `lib/server/`：AI、限流、Supabase 寫入與 API 錯誤處理。
- `configs/`、`types/`、`locales/`：共用設定、型別與翻譯。

## 隱私

訪客的問題、生辰與解讀不儲存；會員的命盤與解讀存入 Supabase，僅本人可見、可刪除。Redis 保留短期額度計數。AI 解讀僅供參考與娛樂，不構成醫療、法律或投資建議。
