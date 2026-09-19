// 12 Earthly Branches in order, each with its zodiac animal.
// Reference point: 2020 = 子 (Rat). Cycle repeats every 12 years.
const BRANCHES = [
  { branch: '子', animal: '鼠', animalEn: 'Rat' },
  { branch: '丑', animal: '牛', animalEn: 'Ox' },
  { branch: '寅', animal: '虎', animalEn: 'Tiger' },
  { branch: '卯', animal: '兔', animalEn: 'Rabbit' },
  { branch: '辰', animal: '龍', animalEn: 'Dragon' },
  { branch: '巳', animal: '蛇', animalEn: 'Snake' },
  { branch: '午', animal: '馬', animalEn: 'Horse' },
  { branch: '未', animal: '羊', animalEn: 'Goat' },
  { branch: '申', animal: '猴', animalEn: 'Monkey' },
  { branch: '酉', animal: '雞', animalEn: 'Rooster' },
  { branch: '戌', animal: '狗', animalEn: 'Dog' },
  { branch: '亥', animal: '豬', animalEn: 'Pig' }
];

const REFERENCE_YEAR = 2020; // 2020 is a Rat year (index 0)

function branchIndexForYear(year) {
  // Approximation by Gregorian year, not exact lunar new year cutover —
  // good enough for a general "which zodiac year" check, not precise bazi calculation.
  const diff = ((year - REFERENCE_YEAR) % 12 + 12) % 12;
  return diff;
}

function animalForYear(year) {
  return BRANCHES[branchIndexForYear(year)];
}

function animalForBirthYear(birthYear) {
  return animalForYear(birthYear);
}

// Traditional clash relationships (三合、六沖、三刑、六害、六破), expressed as branch-index deltas.
const OPPOSITE_DELTA = 6; // 沖太歲: exactly 6 apart

// 三刑 groups (刑太歲) — indices into BRANCHES
const PUNISHMENT_GROUPS = [
  [2, 5, 8], // 寅巳申 (無恩之刑)
  [1, 10, 7], // 丑戌未 (恃勢之刑)
  [0, 3] // 子卯 (無禮之刑)
];
const SELF_PUNISH = [4, 6, 9, 11]; // 辰午酉亥 自刑

// 六害
const HARM_PAIRS = [
  [0, 7], [1, 6], [2, 5], [3, 4], [8, 11], [9, 10]
];

// 六破
const BREAK_PAIRS = [
  [0, 9], [1, 4], [2, 11], [3, 6], [5, 8], [7, 10]
];

function findPairPartner(pairs, index) {
  for (const [a, b] of pairs) {
    if (a === index) return b;
    if (b === index) return a;
  }
  return null;
}

/**
 * Returns the list of zodiac animals considered 犯太歲 (clashing with the year) for a given year,
 * each tagged with the relationship type.
 */
function getClashesForYear(year) {
  const yearIndex = branchIndexForYear(year);
  const results = [];

  // 值太歲 (本命年) — same animal as the year itself
  results.push({ ...BRANCHES[yearIndex], type: '值太歲', typeEn: 'Year of own zodiac (本命年)' });

  // 沖太歲 — directly opposite
  const oppositeIndex = (yearIndex + OPPOSITE_DELTA) % 12;
  results.push({ ...BRANCHES[oppositeIndex], type: '沖太歲', typeEn: 'Direct clash' });

  // 刑太歲
  const punishGroup = PUNISHMENT_GROUPS.find((g) => g.includes(yearIndex));
  if (punishGroup) {
    punishGroup
      .filter((i) => i !== yearIndex)
      .forEach((i) => results.push({ ...BRANCHES[i], type: '刑太歲', typeEn: 'Punishment clash' }));
  }
  if (SELF_PUNISH.includes(yearIndex)) {
    results.push({ ...BRANCHES[yearIndex], type: '刑太歲（自刑）', typeEn: 'Self-punishment' });
  }

  // 害太歲
  const harmPartner = findPairPartner(HARM_PAIRS, yearIndex);
  if (harmPartner !== null) {
    results.push({ ...BRANCHES[harmPartner], type: '害太歲', typeEn: 'Harm clash' });
  }

  // 破太歲
  const breakPartner = findPairPartner(BREAK_PAIRS, yearIndex);
  if (breakPartner !== null) {
    results.push({ ...BRANCHES[breakPartner], type: '破太歲', typeEn: 'Break clash' });
  }

  // De-duplicate by animal, keeping the first (most specific) type found per animal.
  const seen = new Map();
  for (const r of results) {
    if (!seen.has(r.animal)) seen.set(r.animal, r);
  }
  return Array.from(seen.values());
}

/**
 * Checks whether someone born in `birthYear` clashes with `checkYear` (defaults to current year).
 */
function checkZodiacClash(birthYear, checkYear = new Date().getFullYear()) {
  const userAnimal = animalForBirthYear(Number(birthYear));
  const clashes = getClashesForYear(checkYear);
  const match = clashes.find((c) => c.animal === userAnimal.animal);

  return {
    birthYear: Number(birthYear),
    checkYear,
    yearAnimal: animalForYear(checkYear).animal,
    userAnimal: userAnimal.animal,
    isClashing: Boolean(match),
    clashType: match ? match.type : null,
    allClashesThisYear: clashes
  };
}

module.exports = { animalForYear, animalForBirthYear, getClashesForYear, checkZodiacClash, BRANCHES };
