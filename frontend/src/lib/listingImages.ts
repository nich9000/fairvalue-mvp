// Stock photos for listings. Empire Flippers listings are anonymised and come without images, so
// each card gets a photo that fits its niche (or business model). Photos are from Unsplash
// (free licence, no attribution required) and served from their CDN.

type Pool = string[];

const POOLS: Record<string, Pool> = {
  kitchen: [
    '1600489000022-c2086d79f9d4', '1556911220-bff31c812dba', '1484154218962-a197022b5858', '1617228069096-4638a7ffc906',
    '1622372738946-62e02505feb3', '1628797285815-453c1d0d21e3', '1507089947368-19c1da9775ae', '1602028915047-37269d1a73f7',
  ],
  food: [
    '1546069901-ba9599a7e63c', '1512621776951-a57141f2eefd', '1482049016688-2d3e1b311543', '1498837167922-ddd27525d352',
    '1490645935967-10de6ba17061', '1540189549336-e6e99c3679fe', '1490818387583-1baba5e638af', '1467453678174-768ec283a940',
  ],
  home: [
    '1583847268964-b28dc8f51f92', '1605774337664-7a846e9cdf17', '1564078516393-cf04bd966897', '1631510390389-c1e4fb20ff31',
    '1632119580908-ae947d4c7691', '1615529182904-14819c35db37', '1626965556114-27c91c051269', '1502672260266-1c1ef2d93688',
  ],
  apparel: [
    '1558769132-cb1aea458c5e', '1483985988355-763728e1935b', '1441984904996-e0b6ba687e04', '1532453288672-3a27e9be9efd',
    '1441986300917-64674bd600d8', '1567401893414-76b7b1e5a7a5', '1490481651871-ab68de25d43d', '1489987707025-afc232f7ea0f',
  ],
  fitness: [
    '1534438327276-14e5300c3a48', '1517836357463-d25dfeac3438', '1571902943202-507ec2618e8f', '1576678927484-cc907957088c',
    '1623874514711-0f321325f318', '1548690312-e3b507d8c110', '1526506118085-60ce8714f8c5',
  ],
  supplements: [
    '1707129785947-ddc627a8bab9', '1664956618021-73c47736845e', '1565071783280-719b01b29912', '1624362772755-4d5843e67047',
    '1528272252360-5efd274e36fb', '1592323818181-f9b967ff537c', '1648139346494-2b961c5a2bb7',
  ],
  beauty: [
    '1580870069867-74c57ee1bb07', '1608571423902-eed4a5ad8108', '1619451427882-6aaaded0cc61', '1620916297397-a4a5402a3c6c',
    '1552046122-03184de85e08', '1631730486572-226d1f595b68', '1583209814683-c023dd293cc6', '1598440947619-2c35fc9aa908',
  ],
  kids: [
    '1596461404969-9ae70f2830c1', '1515488042361-ee00e0ddd4e4', '1545558014-8692077e9b5c', '1484820540004-14229fe36ca4',
    '1541692641319-981cc79ee10a', '1618842676088-c4d48a6a7c9d', '1535572290543-960a8046f5af', '1575881737088-a5a2bbf44e85',
  ],
  outdoors: [
    '1551632811-561732d1e306', '1533240332313-0db49b459ad6', '1501555088652-021faa106b9b', '1501554728187-ce583db33af7',
    '1629185752152-fe65698ddee4', '1586022045497-31fcf76fa6cc', '1562593028-1fe2d15bde36', '1597120590849-a1d5a743d155',
  ],
  travel: [
    '1504150558240-0b4fd8946624', '1473625247510-8ceb1760943f', '1502301197179-65228ab57f78', '1522199710521-72d69614c702',
    '1534534573898-db5148bc8b0c', '1648737967037-96967e9151b5',
  ],
  automotive: [
    '1492144534655-ae79c964c9d7', '1526726538690-5cbf956ae2fd', '1551522435-a13afa10f103', '1615906655593-ad0386982a0f',
    '1486006920555-c77dcf18193c', '1599256630445-67b5772b1204', '1617898529288-7f3efcf8e299', '1576172474782-567d7ca1975b',
  ],
  pets: [
    '1623387641168-d9803ddd3f35', '1450778869180-41d0601e046e', '1563460716037-460a3ad24ba9', '1602979677071-1781b7f40023',
    '1509205477838-a534e43a849f', '1573435567032-ff5982925350', '1546377791-2e01b4449bf0', '1606098216818-40939b7c98ad',
  ],
  creative: [
    '1613574714687-c33b9e90200d', '1692859532235-c93fa73bd5d0', '1698498441156-bd176ec706a2', '1628586431263-44040b966252',
    '1740710543611-80b658171bc3', '1772485718354-6966d953be57', '1766320635692-b4169023fe5a',
  ],
  books: [
    '1610116306796-6fea9f4fae38', '1532012197267-da84d127e765', '1506880018603-83d5b814b5a6', '1513185041617-8ab03f83d6c5',
    '1495446815901-a7297e633e8d', '1497633762265-9d179a990aa6', '1519682337058-a94d519337bc', '1544716278-ca5e3f4abd8c',
  ],
  tech: [
    '1555664424-778a1e5e1b48', '1515940175183-6798529cb860', '1526738549149-8e07eca6c147', '1593687395549-400945fed803',
    '1605642634357-80a58f89af26', '1519335553051-96f1218cd5fa', '1553408226-42ecf81a214c',
  ],
  office: [
    '1499750310107-5fef28a66643', '1487017159836-4e23ece2e4cf', '1505330622279-bf7d7fc918f4', '1575318634028-6a0cfcb60c59',
    '1611677806845-363fccca2c51', '1612093991429-acd0fc7b1804', '1555212697-194d092e3b8f', '1496664444929-8c75efb9546f',
  ],
  cleaning: [
    '1627905646269-7f034dcc5738', '1563453392212-326f5e854473', '1585421514284-efb74c2b69ba', '1628177142898-93e36e4e3a50',
    '1528740561666-dc2479dc08ab', '1550963295-019d8a8a61c5', '1583907659441-addbe699e921',
  ],
  gifts: [
    '1513201099705-a9746e1e201f', '1513885535751-8b9238bd345a', '1707944145479-12755f0434d8', '1608755728617-aefab37d2edd',
    '1521478706270-f2e33c203d95', '1608755727748-dfa2e44f255b', '1625552187571-7ee60ac43d2b',
  ],
  saas: [
    '1551288049-bebda4e38f71', '1608222351212-18fe0ec7b13b', '1460925895917-afdab827c52f', '1526628953301-3e589a6a8b74',
    '1504868584819-f8e8b4b6d7e3', '1542744173-05336fcc7ad4', '1599658880436-c61792e70672', '1591696205602-2f950c417cb9',
  ],
  app: [
    '1511707171634-5f897ff02aa9', '1512941937669-90a1b58e7e9c', '1480694313141-fce5e697ee25', '1551650975-87deedd944c3',
    '1533022139390-e31c488d69e2', '1483478550801-ceba5fe50e8e', '1526045612212-70caf35c14df', '1555774698-0b77e0d5fac6',
  ],
  content: [
    '1620275765334-4ed948bb4502', '1488190211105-8b0e65b80b4e', '1612367980327-7454a7276aa7', '1501504905252-473c47e087f8',
    '1501618669935-18b6ecb13d6d', '1483546416237-76fd26bbcdd1', '1531346878377-a5be20888e57', '1471107340929-a87cd0f5b5f3',
  ],
  service: [
    '1517048676732-d65bc937f952', '1542744173-8e7e53415bb0', '1568992687947-868a62a9f521', '1522071820081-009f0129c71c',
    '1600880292089-90a7e086ee0c', '1541746972996-4e0b0f43e02a', '1521737604893-d14cc237f11d', '1557804506-669a67965ba0',
  ],
};

// Checked in order against the free-text niche, so more specific themes come first
// ("kitchenware" before "home", "health & fitness" before "health").
const NICHE_THEMES: [string, string[]][] = [
  ['kitchen', ['kitchen', 'kitchenware', 'culinary', 'cookware', 'cooking']],
  ['food', ['food', 'beverage', 'beverages', 'coffee', 'tea', 'snack', 'snacks', 'drink', 'drinks']],
  ['pets', ['pet', 'pets', 'dog', 'dogs', 'cat', 'cats']],
  ['kids', ['children', 'child', 'kids', 'baby', 'toy', 'toys']],
  ['cleaning', ['cleaning']],
  ['beauty', ['personal care', 'beauty', 'skincare', 'cosmetic', 'cosmetics', 'makeup', 'hair']],
  ['fitness', ['fitness', 'gym', 'sport', 'sports', 'equipment', 'yoga']],
  ['supplements', ['supplement', 'supplements', 'medical', 'health', 'wellness', 'vitamins', 'nutrition']],
  ['apparel', ['apparel', 'clothing', 'fashion', 'shoe', 'shoes', 'accessories', 'jewelry']],
  ['home', ['home', 'bed', 'bath', 'furniture', 'garden', 'decor']],
  ['travel', ['travel']],
  ['outdoors', ['outdoor', 'outdoors', 'survival', 'camping', 'hiking', 'hunting', 'fishing']],
  ['automotive', ['automotive', 'motorcycle', 'vehicle', 'vehicles', 'auto']],
  ['creative', ['art', 'arts', 'craft', 'crafts', 'hobbies', 'hobby', 'music', 'design', 'photography', 'entertainment', 'gaming']],
  ['books', ['education', 'news', 'book', 'books', 'religion', 'spirituality', 'information', 'legal']],
  ['tech', ['technology', 'electronics', 'electronic', 'digital media', 'gadgets']],
  ['gifts', ['gift', 'gifts', 'occasions', 'romance', 'wedding', 'lifestyle']],
  ['office', ['business', 'office', 'seo', 'marketing', 'finance']],
];

const MODEL_THEMES: Record<string, string> = {
  saas: 'saas',
  app: 'app',
  content: 'content',
  service: 'service',
  digital_product: 'office',
};

const FALLBACK_POOL: Pool = [...POOLS.home.slice(0, 3), ...POOLS.gifts.slice(0, 3), ...POOLS.office.slice(0, 2)];

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const NICHE_MATCHERS = NICHE_THEMES.map(
  ([theme, words]) => [theme, new RegExp(`\\b(${words.map(escapeRegExp).join('|')})\\b`, 'i')] as const
);

export interface ImageSubject {
  id: string;
  niche_category: string | null;
  business_model: string | null;
}

export function imagePool(subject: ImageSubject): Pool {
  const niche = subject.niche_category ?? '';
  for (const [theme, re] of NICHE_MATCHERS) {
    if (re.test(niche)) return POOLS[theme];
  }
  const modelTheme = subject.business_model ? MODEL_THEMES[subject.business_model] : undefined;
  return modelTheme ? POOLS[modelTheme] : FALLBACK_POOL;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function photoUrl(photoId: string, width: number): string {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&q=70`;
}

// The same listing always gets the same photo, so a card and its detail page match.
export function listingPhoto(subject: ImageSubject): string {
  const pool = imagePool(subject);
  return pool[hash(subject.id) % pool.length];
}

// For a page of listings: start from each listing's own photo, but step past photos already used
// on the page so neighbours in the same niche don't repeat (until a pool runs out).
export function assignListingPhotos(subjects: ImageSubject[]): Map<string, string> {
  const used = new Set<string>();
  const result = new Map<string, string>();
  for (const s of subjects) {
    const pool = imagePool(s);
    const start = hash(s.id) % pool.length;
    let photo = pool[start];
    for (let i = 0; i < pool.length; i++) {
      const candidate = pool[(start + i) % pool.length];
      if (!used.has(candidate)) {
        photo = candidate;
        break;
      }
    }
    used.add(photo);
    result.set(s.id, photo);
  }
  return result;
}
