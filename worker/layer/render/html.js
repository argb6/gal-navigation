/**
 * 页面渲染层 — HTML 工具
 * HTML 拼装、安全序列化
 */

/** 安全 JSON 序列化（防 XSS：转义 </） */
export function safeJson(obj) {
  return JSON.stringify(obj).replace(/<\//g, "<\\/");
}

/** 构建完整 HTML 文档 */
export function buildHtml({ head, body, lang = "zh-CN" }) {
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
${head}
</head>
<body>
${body}
</body>
</html>`;
}

/** 构建 <head> 内容 */
export function buildHead({ meta, styles, scripts = "" }) {
  return [
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<meta name="color-scheme" content="dark">',
    meta || "",
    styles ? `<style>${styles}</style>` : "",
    scripts,
  ].filter(Boolean).join("\n");
}
