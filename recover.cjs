const fs = require('fs');
const transcriptPath = 'C:/Users/Estefania/.gemini/antigravity/brain/c832eb9c-01aa-4262-87e0-af2bf248b782/.system_generated/logs/transcript.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

const filesToRecover = [
  'useCalendar.js',
  'useReservas.js',
  'uiSlice.js',
  'store.js',
  'index.js'
];

const recoveredFiles = {};

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const entry = JSON.parse(line);
    if (entry.tool_calls) {
      for (const call of entry.tool_calls) {
        if (call.name === 'write_to_file' || call.name === 'default_api:write_to_file') {
          const targetFile = call.args.TargetFile || '';
          filesToRecover.forEach(fileName => {
            if (targetFile.includes(fileName)) {
              recoveredFiles[targetFile] = call.args.CodeContent;
            }
          });
        }
      }
    }
  } catch (e) {}
}

console.log(JSON.stringify(Object.keys(recoveredFiles), null, 2));

for (const [path, content] of Object.entries(recoveredFiles)) {
  const normalizedPath = path.replace(/\\\\/g, '/').replace(/^\"|\"$/g, '');
  const dir = normalizedPath.substring(0, normalizedPath.lastIndexOf('/'));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(normalizedPath, content);
  console.log('Recovered: ' + normalizedPath);
}
