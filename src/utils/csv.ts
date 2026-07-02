export interface ParsedGuest {
  nama: string;
  jabatan: string;
  instansi: string;
}

export const parseCSVText = (text: string): ParsedGuest[] => {
  if (!text || !text.trim()) return [];

  const lines = text.split(/\r?\n/);
  const results: ParsedGuest[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detect delimiter: tab, semicolon, or comma
    let delimiter = ',';
    if (line.includes('\t')) {
      delimiter = '\t';
    } else if (line.includes(';')) {
      delimiter = ';';
    }

    const columns = line.split(delimiter).map(col => col.replace(/^["']|["']$/g, '').trim());

    // Skip if it looks like a header (e.g. contains words like 'nama', 'name', 'instansi')
    if (
      i === 0 &&
      (columns[0].toLowerCase() === 'nama' ||
        columns[0].toLowerCase() === 'name' ||
        columns[1]?.toLowerCase() === 'jabatan' ||
        columns[2]?.toLowerCase() === 'instansi')
    ) {
      continue;
    }

    // Ensure we have at least a name
    if (columns[0]) {
      results.push({
        nama: columns[0],
        jabatan: columns[1] || 'Tamu Undangan',
        instansi: columns[2] || 'Instansi/Umum',
      });
    }
  }

  return results;
};
