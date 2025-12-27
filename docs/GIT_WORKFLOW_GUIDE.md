# 專業 Git 版控策略指南 (Git Workflow Guide)

> **目標對象**: 尋求建立穩健開發流程的軟體工程團隊與獨立開發者。
> **適用場景**: TaskRails 專案及中大型軟體專案。

---

## 1. 核心版控哲學

專業的 Git 版控不僅是記錄代碼的歷史，更是**管理風險**與**協調平行開發**的工具。我們推薦採用 **Feature Branch Workflow (功能分支流)** 結合 **Git Flow** 的簡化版。

### 黃金法則

1.  **Main 分支永遠是可部署的**: 嚴禁直接在 `main` 上進行實驗性修改。
2.  **分支即隔離**: 每個新功能或修復都在獨立的房間（分支）進行，不影響主屋（main）。
3.  **版本即快照**: 使用 Tag 標記重要的里程碑。

---

## 2. 分支命名規範 (Branch Naming Convention)

清晰的命名能讓團隊一眼看出分支的目的。

| 前綴        | 用途                      | 範例                                | 生命週期          |
| :---------- | :------------------------ | :---------------------------------- | :---------------- |
| `main`      | 生產環境代碼 (Production) | `main`                              | 永久              |
| `feat/`     | 新功能開發 (Feature)      | `feat/vibe-core`, `feat/login-page` | 短期 (合併後刪除) |
| `fix/`      | Bug 修復                  | `fix/memory-leak`, `fix/typo`       | 短期 (合併後刪除) |
| `chore/`    | 雜項 (不影響代碼邏輯)     | `chore/update-deps`, `chore/docs`   | 短期              |
| `refactor/` | 重構 (代碼優化)           | `refactor/api-structure`            | 短期              |
| `vX.X`      | 版本快照 (Tag/Branch)     | `v1.1` (做為備份分支)               | 長期 (唯讀)       |

---

## 3. 推薦的版控流程 (Recommended Workflow)

針對您目前的 TaskRails 狀態（v1.1 剛完成，準備開發 Vibe Core），建議流程如下：

### 步驟 1: 鎖定基線 (Snapshot)

您已經完成了這一步。建立 `v1.1` 分支作為穩定版的快照。

```bash
git checkout -b v1.1
git push origin v1.1
```

> **意義**: 如果新開發搞砸了，隨時可以切回 `v1.1` 救火。

### 步驟 2: 開啟功能分支 (Feature Start)

**不要**直接建立 `v1.2` 分支進行開發。`v1.2` 應該是開發完成後的**結果**。
請從 `main` (或是 `v1.1`) 建立一個功能分支：

```bash
git checkout main
git pull origin main
git checkout -b feat/vibe-core
```

> **意義**: 這個分支專門用來整合 Vibe Core，不影響主線。

### 步驟 3: 開發與提交 (Commit)

在 `feat/vibe-core` 上進行開發。保持 Commit 顆粒度適中。

```bash
git add .
git commit -m "feat: implement local AI connection"
```

### 步驟 4: 合併與發布 (Merge & Release)

當 Vibe Core 開發完成並測試通過後：

1.  切回主線
2.  合併功能分支
3.  打上 v1.2 的標籤

```bash
git checkout main
git merge feat/vibe-core
git tag -a v1.2 -m "Release v1.2 with Vibe Core"
git push origin main --tags
```

---

## 4. 關於您的提問：現在建立 v1.2 分支好嗎？

**不建議直接建立 `v1.2` 分支來分別開發**，除非您採用的是「版本分支策略 (Version Branching)」且確定該版本會長期維護。

**更好的做法**:
建立一個名為 `feat/vibe-core` (或 `dev-v1.2`) 的分支。

- 如果叫 `v1.2`，這聽起來像是一個已經發布的**結果**。
- 如果叫 `feat/vibe-core`，這清楚表明這是一個**正在進行的過程**。

### 專家建議操作指令

```bash
# 1. 確保在 v1.1 節點
git checkout v1.1

# 2. 建立新功能分支 (基於 v1.1)
git checkout -b feat/vibe-core

# 3. 開始開發...
```

---

## 5. 常見 Git 指令速查

- **查看分支**: `git branch -a`
- **查看狀態**: `git status`
- **圖形化歷史**: `git log --graph --oneline --all`
- **暫存當前工作**: `git stash` (想切換分支但不想提交時用)
- **恢復暫存**: `git stash pop`

---

_此文件由 TaskRails 團隊架構師整理，遵循業界最佳實踐。_
