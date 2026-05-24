import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public', 'bible');
const BOOKS_DIR = join(OUT_DIR, 'books');
const RAW_PATH = join(ROOT, 'scripts', 'krv-raw.json');
const RAW_URL = 'https://raw.githubusercontent.com/laisiangtho/bible/master/json/88.json';

if (!existsSync(RAW_PATH)) {
  console.log(`Fetching KRV raw data from ${RAW_URL}…`);
  const res = await fetch(RAW_URL);
  if (!res.ok) throw new Error(`Failed to fetch raw data: ${res.status}`);
  writeFileSync(RAW_PATH, await res.text());
}

const ENGLISH_NAMES = [
  null,
  ['Genesis', 'Gen'], ['Exodus', 'Exod'], ['Leviticus', 'Lev'], ['Numbers', 'Num'], ['Deuteronomy', 'Deut'],
  ['Joshua', 'Josh'], ['Judges', 'Judg'], ['Ruth', 'Ruth'], ['1 Samuel', '1Sam'], ['2 Samuel', '2Sam'],
  ['1 Kings', '1Kgs'], ['2 Kings', '2Kgs'], ['1 Chronicles', '1Chr'], ['2 Chronicles', '2Chr'], ['Ezra', 'Ezra'],
  ['Nehemiah', 'Neh'], ['Esther', 'Esth'], ['Job', 'Job'], ['Psalms', 'Ps'], ['Proverbs', 'Prov'],
  ['Ecclesiastes', 'Eccl'], ['Song of Songs', 'Song'], ['Isaiah', 'Isa'], ['Jeremiah', 'Jer'], ['Lamentations', 'Lam'],
  ['Ezekiel', 'Ezek'], ['Daniel', 'Dan'], ['Hosea', 'Hos'], ['Joel', 'Joel'], ['Amos', 'Amos'],
  ['Obadiah', 'Obad'], ['Jonah', 'Jonah'], ['Micah', 'Mic'], ['Nahum', 'Nah'], ['Habakkuk', 'Hab'],
  ['Zephaniah', 'Zeph'], ['Haggai', 'Hag'], ['Zechariah', 'Zech'], ['Malachi', 'Mal'],
  ['Matthew', 'Matt'], ['Mark', 'Mark'], ['Luke', 'Luke'], ['John', 'John'], ['Acts', 'Acts'],
  ['Romans', 'Rom'], ['1 Corinthians', '1Cor'], ['2 Corinthians', '2Cor'], ['Galatians', 'Gal'], ['Ephesians', 'Eph'],
  ['Philippians', 'Phil'], ['Colossians', 'Col'], ['1 Thessalonians', '1Thess'], ['2 Thessalonians', '2Thess'], ['1 Timothy', '1Tim'],
  ['2 Timothy', '2Tim'], ['Titus', 'Titus'], ['Philemon', 'Phlm'], ['Hebrews', 'Heb'], ['James', 'Jas'],
  ['1 Peter', '1Pet'], ['2 Peter', '2Pet'], ['1 John', '1John'], ['2 John', '2John'], ['3 John', '3John'],
  ['Jude', 'Jude'], ['Revelation', 'Rev'],
];

const KO_ABBR = [
  null,
  '창', '출', '레', '민', '신', '수', '삿', '룻', '삼상', '삼하',
  '왕상', '왕하', '대상', '대하', '스', '느', '에', '욥', '시', '잠',
  '전', '아', '사', '렘', '애', '겔', '단', '호', '욜', '암',
  '옵', '욘', '미', '나', '합', '습', '학', '슥', '말',
  '마', '막', '눅', '요', '행', '롬', '고전', '고후', '갈', '엡',
  '빌', '골', '살전', '살후', '딤전', '딤후', '딛', '몬', '히', '약',
  '벧전', '벧후', '요일', '요이', '요삼', '유', '계',
];

const raw = JSON.parse(readFileSync(join(ROOT, 'scripts', 'krv-raw.json'), 'utf8'));

if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true });
mkdirSync(BOOKS_DIR, { recursive: true });

const index = [];
let totalVerses = 0;

for (let bookId = 1; bookId <= 66; bookId++) {
  const book = raw.book[bookId];
  const koName = book.info.name;
  const [enName, enAbbr] = ENGLISH_NAMES[bookId];
  const koAbbr = KO_ABBR[bookId];
  const testament = bookId <= 39 ? 'OT' : 'NT';

  const chapters = [];
  const chapterIds = Object.keys(book.chapter).map(Number).sort((a, b) => a - b);
  for (const chId of chapterIds) {
    const ch = book.chapter[chId];
    const verseIds = Object.keys(ch.verse).map(Number).sort((a, b) => a - b);
    const verses = verseIds.map((vId) => ch.verse[vId].text);
    chapters.push(verses);
    totalVerses += verses.length;
  }

  const bookData = {
    id: bookId,
    koName,
    koAbbr,
    enName,
    enAbbr,
    testament,
    chapters,
  };

  writeFileSync(join(BOOKS_DIR, `${bookId}.json`), JSON.stringify(bookData));

  index.push({
    id: bookId,
    koName,
    koAbbr,
    enName,
    enAbbr,
    testament,
    chapterCount: chapters.length,
    verseCounts: chapters.map((c) => c.length),
  });
}

writeFileSync(join(OUT_DIR, 'index.json'), JSON.stringify(index));

console.log(`✓ Built ${index.length} books, ${totalVerses} verses total`);
console.log(`  → public/bible/index.json`);
console.log(`  → public/bible/books/{1..66}.json`);
