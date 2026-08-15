---
type: decision
category: Decision
tags: [md3, alignment, design-system, principle]
status: active
created: 2026-08-14
updated: 2026-08-14
related: [[Design Token]], [[GD 组件库]]
---

# Decision-MD3 对齐口径

## 时间

2026-08（Phase 1 定稿）

## 背景

GALNAVI 需要统一设计系统，但不能丢失品牌视觉 identity。

## 方案

对齐 Material Design 3 的**语义与原则**，不换默认主题。

### 对齐什么

| MD3 维度 | gd 落地 |
|----------|---------|
| 设计原则 | Material is the metaphor / Bold & intentional / Motion provides meaning |
| Color roles | token 角色名对齐（primary / on-surface / error）；色值用 GALNAVI 现网 |
| Shape | `--gd-shape-corner-*` 对应 MD3 corner scale；数值映射自现网 |
| Typography | `--gd-type-*` 档位对齐 Display/Headline/Title/Label/Body |
| Motion | `--gd-motion-*` 参考 MD3 short/medium + emphasized/standard |
| State layers | hover/focus/pressed 透明度叠加 |
| Touch / a11y | 48dp 热区、对比度 AA、`:focus-visible` |
| Components 行为 | Button/Dialog/Nav/Search 交互与无障碍对齐 MD3 |

### 不对齐什么（禁止）

- 整站换成 Material 默认浅色/紫色主题
- 引入 MDC Web 组件库换皮
- 为「像 Google」改 backdrop-filter / 玻璃透明度
- 把 gd-control 做成 MD3 五种 Button 变体硬套

## 原因

**MD3 = 规矩与语义；gd = GALNAVI 皮肤与代码壳。** 语义对齐保证无障碍和交互一致性，视觉保留品牌 identity。

## 影响

- 所有 token 命名遵循 MD3 角色名
- 新增组件必须检查 MD3 行为规范
- 色值可以自由调整，但角色名不变

## 替代方案

1. **完全采用 MD3 默认主题** — 被否决（破坏品牌）
2. **完全自研不参考 MD3** — 被否决（重复造轮子，无障碍标准低）

## Related

- [[Design Token]] — token 实现
- [[GD 组件库]] — 组件体系
- 文件：`gd-architecture.md` §〇
