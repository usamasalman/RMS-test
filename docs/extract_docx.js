import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docxPath = path.resolve(__dirname, 'GRC_Wisdom_Risk_Module_Implementation_Plan.docx');
const outputPath = path.resolve(__dirname, 'extracted_plan.txt');

const buffer = fs.readFileSync(docxPath);

let offset = 0;
while (offset < buffer.length - 4) {
  if (buffer.readUInt32LE(offset) === 0x04034b50) {
    const fnameLen = buffer.readUInt16LE(offset + 26);
    const extraLen = buffer.readUInt16LE(offset + 28);
    const compMethod = buffer.readUInt16LE(offset + 8);
    const compSize = buffer.readUInt32LE(offset + 18);
    const fname = buffer.toString('utf8', offset + 30, offset + 30 + fnameLen);
    const dataStart = offset + 30 + fnameLen + extraLen;

    if (fname === 'word/document.xml') {
      let xml;
      if (compMethod === 8) {
        xml = zlib.inflateRawSync(buffer.slice(dataStart, dataStart + compSize)).toString('utf8');
      } else {
        xml = buffer.toString('utf8', dataStart, dataStart + compSize);
      }

      let text = xml
        .replace(/<w:br[^/]*\/>/g, '\n')
        .replace(/<\/w:p>/g, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\r?\n(\r?\n)+/g, '\n\n')
        .trim();

      fs.writeFileSync(outputPath, text, 'utf8');
      console.log(`Extracted ${text.length} chars to extracted_plan.txt`);
      process.exit(0);
    }

    offset = dataStart + compSize;
  } else {
    offset++;
  }
}

console.error('Could not find word/document.xml');
process.exit(1);
