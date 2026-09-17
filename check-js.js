/*
 * 单文件 HTML Demo · 内联 <script> JS 语法自检脚本
 * 用法：
 *   node check-js.js <file1.html> [file2.html] ...
 *   node check-js.js                 # 无参时扫描 ../prototypes 下所有 .html
 *
 * 目的：每次改完 HTML Demo 后跑一次，避免把语法错误交付出去。
 * 项目约定见 ../conventions/PROJECT_MEMORY.md §九。
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function checkFile(file) {
  const html = fs.readFileSync(file, 'utf8');
  const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  let ok = true;
  blocks.forEach((m, i) => {
    try {
      vm.compileFunction(m[1]);
    } catch (e) {
      ok = false;
      console.log(`  ✗ SCRIPT#${i} ERROR: ${e.message}`);
    }
  });
  const label = path.basename(file);
  if (ok) console.log(`✓ ${label} JS OK (${blocks.length} script block${blocks.length === 1 ? '' : 's'})`);
  else console.log(`✗ ${label} JS FAIL`);
  return ok;
}

function main() {
  const args = process.argv.slice(2);
  let files = args;
  if (files.length === 0) {
    const dir = path.resolve(__dirname, '..', 'prototypes');
    if (!fs.existsSync(dir)) {
      console.error('未提供文件参数，且默认扫描目录不存在：' + dir);
      process.exit(2);
    }
    files = fs.readdirSync(dir)
      .filter(f => f.toLowerCase().endsWith('.html'))
      .map(f => path.join(dir, f));
  }
  if (files.length === 0) {
    console.error('没有可检查的文件');
    process.exit(2);
  }
  let allOk = true;
  files.forEach(f => { if (!checkFile(f)) allOk = false; });
  process.exit(allOk ? 0 : 1);
}

main();
