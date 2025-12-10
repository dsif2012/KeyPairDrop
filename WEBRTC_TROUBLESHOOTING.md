# 🔧 WebRTC 連接問題排查指南

## 常見錯誤及解決方案

### 1. "Access to storage is not allowed from this context"

**原因**:
- 應用在 iframe 中運行（第三方嵌入）
- 瀏覽器的第三方 Cookie/Storage 限制
- 隱私模式或嚴格的瀏覽器設定

**已修復**:
- ✅ 創建了 `src/lib/storage-safe.ts` 安全存取工具
- ✅ 更新了 `src/lib/firebase.ts` 使用安全初始化
- ✅ 添加了錯誤處理，不會中斷應用運行

**用戶解決方案**:
- 如果是在 iframe 中，建議在新視窗中打開應用
- 檢查瀏覽器的 Cookie/Storage 設定
- 嘗試使用不同的瀏覽器

### 2. "Peer error: Error: Connection failed"

**原因**:
- NAT/防火牆阻擋 WebRTC 連接
- STUN 伺服器無法連接
- 網路環境限制（公司網路、公共 WiFi）
- ICE 候選者交換失敗

**已修復**:
- ✅ 添加了多個備用 STUN 伺服器
- ✅ 增加了 ICE 候選者池大小
- ✅ 改進了錯誤訊息，提供更具體的提示
- ✅ 添加了 ICE 狀態監聽

**用戶解決方案**:

#### 方案 1: 檢查網路環境
- 嘗試使用不同的網路（例如從 WiFi 切換到行動網路）
- 檢查防火牆設定
- 如果在公司網路，可能需要 IT 管理員協助

#### 方案 2: 使用 TURN 伺服器（進階）
如果需要更可靠的連接，可以添加 TURN 伺服器：

```typescript
// 在 src/hooks/useP2P.ts 的 iceServers 中添加
{
  urls: 'turn:your-turn-server.com:3478',
  username: 'your-username',
  credential: 'your-credential'
}
```

**免費 TURN 服務**:
- [Twilio STUN/TURN](https://www.twilio.com/stun-turn) (有免費額度)
- [Xirsys](https://xirsys.com/) (有免費方案)

#### 方案 3: 檢查瀏覽器設定
- 確保允許 WebRTC
- 檢查是否有擴充功能阻擋 WebRTC
- 嘗試無痕模式

### 3. 連接超時

**已改進**:
- ✅ 增加了連接超時時間
- ✅ 添加了重連機制

## 技術改進

### 1. 多個 STUN 伺服器
```typescript
iceServers: [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:global.stun.twilio.com:3478' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' }
]
```

### 2. 改進的錯誤處理
- 更具體的錯誤訊息
- ICE 狀態監聽
- 連接失敗自動重試提示

### 3. Storage 安全存取
- 處理 iframe 限制
- 優雅降級（不影響核心功能）

## 測試建議

1. **本地測試**: 在同一網路下的兩台設備測試
2. **跨網路測試**: 在不同網路下的設備測試
3. **防火牆測試**: 在受限網路環境測試

## 監控和日誌

所有 WebRTC 相關錯誤都會記錄到：
- 開發環境：瀏覽器 Console
- 生產環境：可整合到錯誤監控服務（如 Sentry）

查看日誌：
```typescript
// 在瀏覽器 Console 中查看
// ICE state 變化
// Peer error 詳細訊息
```

## 如果問題持續

1. 檢查瀏覽器 Console 的完整錯誤訊息
2. 檢查網路連線狀態
3. 嘗試使用不同的設備/瀏覽器
4. 考慮添加 TURN 伺服器以支援更複雜的網路環境

