<div align="center">
  <img src="https://img.nextedge-ai-studio.com/logo.png" alt="KeyPairDrop Logo" width="120" />
  <h1>KeyPairDrop</h1>
  <p>
    <strong>Secure, Fast, and Private P2P File Sharing</strong><br>
    Effortlessly share files across devices with end-to-end encryption.<br>
    極速、安全、隱私的點對點檔案傳輸服務。
  </p>

  <p>
    <a href="#-english">English</a> •
    <a href="#-中文">中文</a>
  </p>

  [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdsif2012%2FKeyPairDrop)
  <br />
  <a href="https://keypairdrop.vercel.app/"><strong>Live Demo »</strong></a>
</div>

<br>

---

<div id="-english"></div>

## ✨ Features

KeyPairDrop is a modern file sharing tool designed for privacy and speed. Unlike traditional cloud storage, your files are **never stored** on our servers. They stream directly from your device to the recipient via WebRTC.

*   **⚡ Blazing Fast P2P**: Direct peer-to-peer transfer via WebRTC. No speed limits, no file size limits.
*   **🔒 End-to-End Encryption**: All data is encrypted (DTLS) during transit. Only the person with the unique **Pair Key** can receive the files.
*   **📂 Folder Support**: Drag and drop entire folders. The directory structure is preserved and can be downloaded as a **Zip** file.
*   **📦 Batch Transfer**: Send multiple files at once with an automatic queue system.
*   **🎥 Live Preview**: Instantly preview images and videos without downloading them first.
*   **🎨 Modern UI/UX**: Stunning **Dark Mode** interface with fluid **Flow Field** particle background and fully responsive design.
*   **☁️ Serverless Signaling**: Uses Firebase Realtime Database strictly for signaling handshake. No file data ever touches the database.

## 🛠️ Tech Stack

*   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/)
*   **P2P / WebRTC**: [simple-peer](https://github.com/feross/simple-peer)
*   **File Handling**: [JSZip](https://stuk.github.io/jszip/) (Client-side zipping)
*   **Signaling Server**: [Firebase Realtime Database](https://firebase.google.com/docs/database)
*   **Animation**: Custom Canvas Flow Field Particles

## 🚀 Getting Started

Follow these steps to run KeyPairDrop locally.

### 1. Clone the repository

```bash
git clone https://github.com/dsif2012/KeyPairDrop.git
cd KeyPairDrop
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory and add your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_measurement_id
```

> **How to get Firebase Config?**
> 1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
> 2. Add a **Web App** to your project.
> 3. Copy the SDK config from Project Settings.
> 4. Enable **Realtime Database** and set the rules to `true` for development.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

<div id="-中文"></div>

## ✨ 功能特色

KeyPairDrop 是一個現代化的檔案分享工具，專注於隱私與速度。不同於傳統雲端硬碟，您的檔案**不會**經過我們的伺服器儲存，而是透過 WebRTC 直接從您的裝置傳送到接收者手中。

*   **⚡ 極速 P2P 傳輸**: 基於 WebRTC 技術，檔案直接點對點傳輸，不限速、不限檔案大小。
*   **🔒 端對端加密**: 傳輸過程全程加密 (DTLS)，只有持有配對金鑰 (Pair Key) 的人能接收檔案。
*   **📂 資料夾傳輸**: 支援拖拉整個資料夾，接收端完整保留目錄結構。
*   **📦 批量傳送**: 支援一次傳送多個檔案，自動佇列處理。
*   **📦 一鍵打包**: 接收端可將收到的多個檔案或資料夾，一鍵打包成 Zip 下載。
*   **🎥 線上預覽**: 支援圖片、影片檔案即時預覽，無需下載即可檢視。
*   **🎨 絕美介面**: 極致的深色模式 (Dark Mode)，搭配流暢的動態粒子背景 (Flow Field) 與 RWD 響應式設計。
*   **☁️ 無伺服器中轉**: 使用 Firebase Realtime Database 僅作為信令交換 (Signaling)，檔案內容絕不落地。

## 🛠️ 技術堆疊

*   **框架**: [Next.js 16](https://nextjs.org/) (App Router)
*   **語言**: [TypeScript](https://www.typescriptlang.org/)
*   **樣式**: [Tailwind CSS](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/)
*   **P2P / WebRTC**: [simple-peer](https://github.com/feross/simple-peer)
*   **檔案處理**: [JSZip](https://stuk.github.io/jszip/) (前端壓縮打包)
*   **信令伺服器**: [Firebase Realtime Database](https://firebase.google.com/docs/database)
*   **動畫**: Custom Canvas Flow Field Particles

## 🚀 快速開始

### 1. 複製專案 (Clone)

```bash
git clone https://github.com/dsif2012/KeyPairDrop.git
cd KeyPairDrop
```

### 2. 安裝依賴 (Install)

```bash
npm install
# or
yarn install
```

### 3. 設定環境變數 (Environment Variables)

請在專案根目錄建立 `.env.local` 檔案，並填入您的 Firebase 設定：

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_measurement_id
```

> **如何取得 Firebase Config?**
> 1. 前往 [Firebase Console](https://console.firebase.google.com/) 建立專案。
> 2. 新增一個 Web App。
> 3. 在 Project Settings 中複製 SDK config。
> 4. 啟用 **Realtime Database** 並設定規則為 `true` (開發用)。

### 4. 啟動開發伺服器

```bash
npm run dev
```

開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000) 即可開始使用。

## 🤝 貢獻 (Contributing)

歡迎提交 Issue 或 Pull Request！

1.  Fork 本專案
2.  建立新的 Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit 您的變更 (`git commit -m 'Add some AmazingFeature'`)
4.  Push 到 Branch (`git push origin feature/AmazingFeature`)
5.  開啟 Pull Request

## 📄 授權 (License)

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/dsif2012">日廣</a>
</p>
