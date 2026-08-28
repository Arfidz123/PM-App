const fs = require('fs');
const path = require('path');

const specsPath = path.join(__dirname, 'raw_specs.txt');
const coordsPath = path.join(__dirname, 'raw_coords.txt');

const specsText = fs.readFileSync(specsPath, 'utf8').split('\n').map(l => l.trim()).filter(l => l.length > 0);
const coordsText = fs.readFileSync(coordsPath, 'utf8').split('\n').map(l => l.trim()).filter(l => l.length > 0);

// We know the structure:
// Rows 1-82
// Columns are in chunks.

const pops = [];
for(let i=0; i<82; i++) {
    pops.push({ id: i+1 });
}

// 1. Parse Cols 1-3 (No, Kategori, POP Name)
// The lines start with the number. e.g. "1 POP-B POP_1KDI001_KENDARI AREA PLN"
let rowIdx = 0;
for (const line of specsText) {
    const match = line.match(/^(\d+)\s+(POP-[A-Z])\s+(.+)$/);
    if (match) {
        const no = parseInt(match[1], 10);
        if (no >= 1 && no <= 82) {
            pops[no-1].kategori = match[2];
            pops[no-1].popName = match[3];
        }
    }
}

// 2. Parse Cols 4-8 (POP ID, Kantor, Tipe POP, Jumlah OLT, Keterangan)
// Example: "POP_1KDI001 Kendari Colo"
// "Kendari Mini PoP Tidak Aktif"
// Wait, this is trickier because some rows don't have POP ID! e.g. "Kendari Mini PoP Tidak Aktif"
// Also the OLT count and Keterangan are optional.
// Since it's exactly 82 lines of data in the PDF for cols 4-8... let's extract them by line sequence.
// Looking at raw_specs.txt, after "4 5 6 7 8"
const col4_start = specsText.findIndex(l => l === '4 5 6 7 8');
if (col4_start !== -1) {
    let current_pop = 0;
    for (let i = col4_start + 1; i < specsText.length; i++) {
        if (specsText[i] === 'ID PLN Daya Phasa Brand + Type Phasa' || specsText[i].includes('ID PLN')) break;
        if (specsText[i] === 'POP ID KANTOR TIPE POP JUMLAH OLT KETERANGAN') continue;
        if (current_pop >= 82) break; // In case of extra text like 'Satu RACK' on a new line
        
        // This is heuristic because some lines wrap or don't have POP ID
        const line = specsText[i];
        
        // Let's just store the raw line for now, we can parse it if needed
        pops[current_pop].rawCol4_8 = line;
        
        // Try basic split: if it starts with POP_, it has POP ID.
        if (line.startsWith('POP_')) {
            const parts = line.split(' ');
            pops[current_pop].popId = parts[0];
            pops[current_pop].kantor = parts[1];
            pops[current_pop].tipePop = parts.slice(2).join(' ');
        } else if (line.startsWith('Kendari')) {
            const parts = line.split(' ');
            pops[current_pop].popId = '';
            pops[current_pop].kantor = parts[0];
            pops[current_pop].tipePop = parts.slice(1).join(' ');
        } else {
             // Handle exceptions like "Satu RACK" which is just a newline from previous
             if(line === 'Satu RACK' || line === 'Perlu dipastikan') {
                 pops[current_pop-1].rawCol4_8 += ' ' + line;
                 continue; // Don't advance current_pop
             }
        }
        
        current_pop++;
    }
}

// Coordinate parsing
for (const line of coordsText) {
    if (line.includes(',') && (line.includes('TK 4') || line.includes('TK'))) {
        const parts = line.split(/ (-?\d+\.\d+), (\d+\.\d+)/);
        if (parts.length >= 3) {
            const name = parts[0].trim();
            const lat = parseFloat(parts[1]);
            const lng = parseFloat(parts[2]);
            
            // Try to match name with popName
            // name example: "TK 4_RSUL_Kota Kendari_Lepo-Lepo"
            // popName example: "POP_1KDI0018_TK4 LEPO LEPO KENDARI ODC"
            const nameTokens = name.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(t => t.length > 2 && t !== 'kota' && t !== 'rsul' && t !== 'tk');
            
            let bestMatch = null;
            let maxScore = 0;
            
            for (const p of pops) {
                if (!p.popName) continue;
                const pTokens = p.popName.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/);
                let score = 0;
                for (const t of nameTokens) {
                    if (pTokens.includes(t)) score++;
                }
                if (score > maxScore) {
                    maxScore = score;
                    bestMatch = p;
                }
            }
            
            if (bestMatch && maxScore > 0) {
                bestMatch.lat = lat;
                bestMatch.lng = lng;
            }
        }
    }
}


// Generate final data mapped to popSeedData format
const seedData = pops.map((p, idx) => ({
    id: String(p.id),
    asset_code: p.popId ? `${p.popId}_${p.popName}` : (p.popName || `POP-GEN-${p.id}`),
    name: p.popId ? `${p.popId}_${p.popName}` : (p.popName || `Unknown POP ${p.id}`),
    category: p.kategori || 'POP-A',
    location: p.kantor || 'KENDARI',
    specifications: JSON.stringify({
        id_pln: '',
        daya: '',
        phasa: '',
        rectifier_brand: p.tipePop?.replace(/ \d.*$/, '') || ''
    }),
    latitude: p.lat || null,
    longitude: p.lng || null,
}));

const outputDir = path.join(__dirname, '../src/database');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const tsContent = `// AUTOGENERATED SEED DATA WITH COORDINATES\nexport const POP_SEED_DATA = ${JSON.stringify(seedData, null, 2)};\n`;
fs.writeFileSync(path.join(outputDir, 'popSeedData.ts'), tsContent, 'utf8');
console.log(`Generated ${seedData.length} POPs into src/database/popSeedData.ts`);

