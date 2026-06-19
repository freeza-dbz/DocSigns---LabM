import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';

async function main() {
  const url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  const destDir = './scratch';
  const destPath = path.join(destDir, 'sample.pdf');

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  console.log(`Downloading sample PDF from: ${url}`);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch PDF: ${res.statusText}`);
    }
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(buffer));
    console.log(`✅ Sample PDF saved successfully to: ${path.resolve(destPath)}`);
  } catch (error) {
    console.error('❌ Error downloading PDF:', error.message);
  }
}

main();
