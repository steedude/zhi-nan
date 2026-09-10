# 指南 Architecture

程式負責排盤，AI 負責解讀。前端先排盤以立即呈現；伺服器驗證輸入並重新排盤，再交給 Gemini。

## 請求流程

```text
QuestionStep → BirthStep → useReadingFlow
  ├─ computeBazi → 命盤
  └─ useInterpretationStream → POST /api/interpret
       → 輸入驗證
       → Supabase 驗證 session
       → 每分鐘限流、每日額度原子扣除
       → computeBazi → Gemini stream
       → HTTP 文字串流
       → 完成後儲存會員 readings
```

## 前端職責

| 模組                    | 職責                                                |
| ----------------------- | --------------------------------------------------- |
| app/page.tsx            | Server Component 入口                               |
| ReadingWizard           | 組合步驟、命盤與解讀                                |
| useReadingFlow          | 表單、步驟及結果狀態                                |
| useInterpretationStream | 讀取 UTF-8 串流、API 錯誤、離頁取消                 |
| StepCard                | 兩個輸入步驟共用標題、描述與間距                    |
| BaziChartCard           | 命盤組合，內部分為 PillarCard 與 WuXingDistribution |
| InterpretationContent   | 首頁與歷史頁共用段落、標題排版                      |
| InterpretationCard      | 串流、錯誤、複製與免責文字                          |
| AuthProvider / useUser  | 全站共用登入狀態與 openAuth，不使用全域字串事件     |
| useReadings             | 歷史查詢、刪除、載入與錯誤狀態                      |
| ReadingHistoryItem      | 單筆紀錄、展開與刪除按鈕                            |

`AuthProvider` 位於 next-intl provider 內，因此登入視窗使用同一份語系。初始查詢不覆蓋較新的登入／登出事件。

歷史清單以 user id 為 React key 掛載，切換帳號時丟棄舊狀態。過期查詢不覆蓋新查詢；刪除必須確認資料庫實際回傳刪除的 id，失敗時保留畫面資料並提供提示。

## 樣式與型別

- `app/globals.css` 定義語意色彩、陰影、字型、容器與動畫；支援減少動態效果偏好。
- `components/ui/` 提供 Button、Card、Dialog 等基礎樣式，頁面只補版面差異。
- `configs/wuxing.ts` 合併五行文字、長條與漸層配色。
- `types/bazi.ts` 的 WuXing 為五個明確值，避免任意字串索引造成配色遺漏。
- API 輸入由 `lib/validation/interpret.ts` 的 Zod schema 驗證。

## 後端職責

| 模組                            | 職責                                     |
| ------------------------------- | ---------------------------------------- |
| app/api/interpret/route.ts      | 驗證及協調服務                           |
| lib/server/interpret/session.ts | 驗證會員 session                         |
| lib/server/interpret/quota.ts   | 依會員身分選擇每日額度                   |
| lib/server/rate-limit.ts        | 每分鐘限流、以台北日期建立每日 Redis key |
| lib/server/daily-quota.ts       | Redis Lua 原子檢查與遞增                 |
| lib/server/interpret/stream.ts  | Gemini → HTTP stream，完成後儲存         |
| lib/server/readings.ts          | 保存會員紀錄                             |
| lib/server/api-errors.ts        | 翻譯錯誤訊息與 Sentry 上報               |

每分鐘限流沿用 Upstash sliding window。每日額度使用：

```text
zhi-nan:daily:anon:{ip}:{taipeiDate}
zhi-nan:daily:member:{userId}:{taipeiDate}
```

每日 key 的有效期為 48 小時，以日期區分額度，不會在 UTC 午夜把台北當天的額度重置。超額請求不增加計數。

扣額度發生在生成前；後續失敗不退回額度。讀取、保存、刪除 readings 都不影響計數。正式環境 Redis 缺少設定或不可用時拒絕請求；記憶體備援僅供開發。

首次升級改用新的每日 key，當天由新 key 起算；無需資料庫 migration。正式部署需要確保 Upstash 設定存在。

## 錯誤與資料保存

- 輸入錯誤與超額：回傳翻譯後的 400／429，不上報 Sentry。
- AI、Redis、Supabase 服務失敗：上報 Sentry。
- 串流中斷：前端顯示錯誤並保留已收到的文字；離頁時取消前端請求。
- 會員解讀完成才寫入 Supabase。寫入失敗會上報，目前不阻斷已產生的解讀。
- Supabase RLS 限制本人存取；訪客解讀不保存。

## 測試

單元／元件測試涵蓋排盤、共享登入訂閱、歷史查詢重試與刪除失敗、UTF-8 串流、取消、錯誤後的內容保留、額度分流。

Redis 整合測試在本機容器執行真實 Lua，驗證並行上限、拒絕後計數、到期時間及使用者／日期隔離。執行方式見 README。

Playwright 使用正式建置、固定日期與模擬 API，驗證完整流程、額度錯誤、語系切換與手機寬度；不存取真實 AI。
