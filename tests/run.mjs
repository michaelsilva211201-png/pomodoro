import { run } from './runner.js';
import './all.js';

const results = await run();
for (const r of results) {
  console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${r.name}${r.ok ? '' : `\n     ${r.error}`}`);
}
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} testes passaram`);
process.exitCode = failed ? 1 : 0;
