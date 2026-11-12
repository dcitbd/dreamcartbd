/**
 * DREAM CART BD — INTELLIGENT E-COMMERCE SEARCH & RELEVANCE SERVICE (SearchService.js)
 * High-precision search algorithm:
 * - Multi-token, multi-field matching (Name, SKU, Brand, Category, Sub-category, Description, Specs)
 * - Exact & highest-relevance products appear FIRST
 * - Related products (same category/brand/sub-category) appear right after direct matches
 * - Bilingual Bengali & English support (synonyms & semantic term expansion)
 */

// 1. Concept / Category-level Synonyms
export const CONCEPT_SYNONYMS = {
  // Wearables & Watches
  "ঘড়ি": ["watch", "smartwatch", "clock", "ঘড়ি", "স্মার্টওয়াচ", "স্মার্টওয়াচ"],
  "ঘড়ি": ["watch", "smartwatch", "clock", "ঘড়ি", "স্মার্টওয়াচ", "স্মার্টওয়াচ"],
  "ওয়াচ": ["watch", "smartwatch", "ঘড়ি", "ঘড়ি"],
  "ওয়াচ": ["watch", "smartwatch", "ঘড়ি", "ঘড়ি"],
  "স্মার্টওয়াচ": ["smartwatch", "watch", "ঘড়ি", "ঘড়ি", "স্মার্টওয়াচ"],
  "স্মার্টওয়াচ": ["smartwatch", "watch", "ঘড়ি", "ঘড়ি", "স্মার্টওয়াচ"],
  "watch": ["smartwatch", "ঘড়ি", "ঘড়ি", "স্মার্টওয়াচ", "স্মার্টওয়াচ"],
  "smartwatch": ["watch", "ঘড়ি", "ঘড়ি", "স্মার্টওয়াচ", "স্মার্টওয়াচ"],

  // Organic / Honey / Superfoods
  "মধু": ["honey", "modhu", "raw honey"],
  "honey": ["মধু", "modhu"],
  "modhu": ["মধু", "honey"],
  "চিয়া": ["chia", "chia seeds", "চিয়া"],
  "চিয়া": ["chia", "chia seeds", "চিয়া"],
  "chia": ["চিয়া", "চিয়া", "seeds"],

  // Tactical Lighting / Torches
  "লাইট": ["light", "torch", "flashlight", "লণ্ঠন", "টর্চ"],
  "টর্চ": ["torch", "flashlight", "light", "লাইট"],
  "torch": ["টর্চ", "লাইট", "flashlight", "light"],
  "light": ["লাইট", "টর্চ", "torch", "lantern", "লণ্ঠন"],
  "flashlight": ["টর্চ", "লাইট", "torch", "light"],
  "লণ্ঠন": ["lantern", "solar", "সোলার", "লাইট"],
  "lantern": ["লণ্ঠন", "solar", "light"],
  "সোলার": ["solar", "লণ্ঠন", "লাইট"],
  "solar": ["সোলার", "lantern", "light"],

  // Kitchen Safety / Gas Regulators
  "গ্যাস": ["gas", "regulator", "রেগুলেটর"],
  "gas": ["গ্যাস", "regulator", "রেগুলেটর"],
  "রেগুলেটর": ["regulator", "gas", "গ্যাস"],
  "regulator": ["রেগুলেটর", "gas", "গ্যাস"],
  "পাইপ": ["pipe", "hose", "হোস"],
  "pipe": ["পাইপ", "hose", "হোস"]
};

// 2. Specific Brand & Model Name Translations (do NOT expand to full category)
export const BRAND_TRANSLATIONS = {
  "amazfit": ["অ্যামাজফিট", "gts", "gts 4"],
  "অ্যামাজফিট": ["amazfit"],
  "kieslect": ["কিসলেক্ট", "ks pro"],
  "কিসলেক্ট": ["kieslect"],
  "hk9": ["এইচকে৯", "hk"],
  "এইচকে৯": ["hk9", "hk"]
};

// Generic Stop Words & Store Prefixes
const STOP_WORDS = new Set([
  "dcbd", "এর", "টি", "টা", "টিপস", "দাম", "কত", "price", "the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "with"
]);

/**
 * Clean & normalize text for uniform comparison
 */
export function normalizeSearchText(text) {
  if (!text) return "";
  return String(text)
    .toLowerCase()
    .replace(/[,\-_—–/\\()|:;!?.+\[\]"']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tokenize string into non-empty search terms excluding stop words
 */
export function tokenizeQuery(text) {
  const norm = normalizeSearchText(text);
  if (!norm) return [];
  return norm.split(" ").filter(t => t.length > 0 && !STOP_WORDS.has(t));
}

/**
 * Clean SKU for precise alphanumeric comparison
 */
export function cleanSku(sku) {
  return String(sku || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Check if text contains word as whole word if short, or as substring if long
 */
export function containsWord(text, word) {
  if (!text || !word) return false;
  if (word.length <= 3) {
    const rx = new RegExp("(^|\\s)" + word + "(\\s|$)", "i");
    return rx.test(text);
  }
  return text.includes(word);
}

/**
 * Compute relevance score for a product against a search query
 */
export function calculateProductRelevance(product, query) {
  if (!product || !query) return 0;

  const qNorm = normalizeSearchText(query);
  const qCleanSku = cleanSku(query);
  const qTokens = tokenizeQuery(query);

  if (!qNorm && !qCleanSku) return 0;

  const pSku = cleanSku(product.sku || product.product_id);
  const pName = normalizeSearchText(product.name || product.p_name);
  const pBrand = normalizeSearchText(product.brand);
  const pCat = normalizeSearchText(product.category);
  const pSub = normalizeSearchText(product.sub_category);
  const pChild = normalizeSearchText(product.child_category);
  const pSlug = normalizeSearchText(product.slug);
  const pDesc = normalizeSearchText((product.description || "") + " " + (product.specification || "") + " " + (product.others || ""));

  // 1. EXACT SKU / MODEL MATCH (Supreme priority: always 1st)
  const isSkuQuery = qCleanSku.startsWith("dcbd") || (qCleanSku.length >= 6 && /\d/.test(qCleanSku));
  if (pSku && qCleanSku) {
    if (pSku === qCleanSku) {
      return 1500;
    } else if (pSku.endsWith(qCleanSku)) {
      return 800;
    } else if (!isSkuQuery && qCleanSku.length >= 4 && pSku.includes(qCleanSku)) {
      return 400;
    }
  }

  // If query is an exact full SKU query (e.g. DCBD-SM-001) and this product is not that SKU,
  // do not award general token matches to prevent all other products with "001" from matching directly
  if (isSkuQuery && pSku !== qCleanSku && !pSku.endsWith(qCleanSku)) {
    return 0; // Will be shown as related product if category matches!
  }

  let score = 0;

  // 2. EXACT NAME & PHRASE MATCH
  if (pName) {
    if (pName === qNorm) {
      score += 1000;
    } else if (pName.startsWith(qNorm)) {
      score += 700;
    } else if (pName.includes(qNorm)) {
      score += 500;
    }
  }

  // 3. EXACT BRAND MATCH
  if (pBrand) {
    if (pBrand === qNorm) {
      score += 400;
    } else if (pBrand.includes(qNorm)) {
      score += 250;
    }
  }

  // 4. EXACT CATEGORY / SUB-CATEGORY MATCH
  if (pCat) {
    if (pCat === qNorm) {
      score += 300;
    } else if (pCat.includes(qNorm)) {
      score += 180;
    }
  }
  if (pSub) {
    if (pSub === qNorm) {
      score += 250;
    } else if (pSub.includes(qNorm)) {
      score += 150;
    }
  }
  if (pChild && pChild.includes(qNorm)) {
    score += 120;
  }

  // 5. SLUG MATCH
  if (pSlug && pSlug.includes(qNorm.replace(/\s+/g, "-"))) {
    score += 150;
  }

  // 6. TOKEN-BY-TOKEN MATCHING
  let matchedTokensInName = 0;
  let matchedTokensOverall = 0;

  qTokens.forEach(token => {
    let tokenMatched = false;

    // Token in Name (Whole word vs Substring)
    if (containsWord(pName, token)) {
      matchedTokensInName++;
      tokenMatched = true;
      const wordRegex = new RegExp("(^|\\s)" + token + "(\\s|$)", "i");
      if (wordRegex.test(pName)) {
        score += 100;
      } else {
        score += 50;
      }
    }

    // Token in Brand
    if (containsWord(pBrand, token)) {
      score += 80;
      tokenMatched = true;
    }

    // Token in Category
    if (containsWord(pCat, token)) {
      score += 60;
      tokenMatched = true;
    }
    if (containsWord(pSub, token)) {
      score += 50;
      tokenMatched = true;
    }
    if (containsWord(pChild, token)) {
      score += 40;
      tokenMatched = true;
    }

    // Meaningful alphanumeric SKU token (only if clean SKU token is at least 3 chars)
    const cToken = cleanSku(token);
    if (cToken && cToken.length >= 3 && !STOP_WORDS.has(cToken) && pSku.includes(cToken)) {
      score += 80;
      tokenMatched = true;
    }

    // Token in Description / Specs
    if (containsWord(pDesc, token)) {
      score += 20;
      tokenMatched = true;
    }

    // Brand Translations (e.g. amazfit -> অ্যামাজফিট)
    if (BRAND_TRANSLATIONS[token]) {
      BRAND_TRANSLATIONS[token].forEach(tr => {
        if (containsWord(pName, tr) || containsWord(pBrand, tr)) {
          score += 90;
          tokenMatched = true;
        }
      });
    }

    // Concept / Category Synonyms (e.g. ঘড়ি -> watch, smartwatch)
    if (CONCEPT_SYNONYMS[token]) {
      CONCEPT_SYNONYMS[token].forEach(syn => {
        if (containsWord(pName, syn)) {
          score += 70;
          tokenMatched = true;
        }
        if (containsWord(pCat, syn) || containsWord(pSub, syn)) {
          score += 45;
          tokenMatched = true;
        }
      });
    }

    if (tokenMatched) {
      matchedTokensOverall++;
    }
  });

  // 7. MULTI-TOKEN COMPLETENESS BONUSES
  if (qTokens.length > 1) {
    if (matchedTokensInName === qTokens.length) {
      score += 250; // All tokens present in Name
    } else if (matchedTokensOverall === qTokens.length) {
      score += 150; // All tokens present across fields
    }
  }

  // Also check joined token without spaces (e.g. "smart watch" -> "smartwatch", "gts 4" -> "gts4")
  const joinedNoSpace = qTokens.join("");
  if (joinedNoSpace.length > 3) {
    if (pName.replace(/\s+/g, "").includes(joinedNoSpace)) score += 150;
    if (pCat.replace(/\s+/g, "").includes(joinedNoSpace)) score += 80;
  }

  return score;
}

/**
 * Intelligent Catalog Search
 * Separates into:
 * - Direct matches (most matching first, sorted by relevance score)
 * - Related products (products sharing category/brand/sub-category, displayed after direct matches)
 */
export function searchProducts(allProducts = [], query = "", options = {}) {
  const q = (query || "").trim();
  const list = Array.isArray(allProducts) ? allProducts : [];

  if (!q) {
    return {
      directMatches: list,
      relatedProducts: [],
      allResults: list,
      query: "",
      totalCount: list.length
    };
  }

  // 1. Calculate relevance scores for all products
  const scored = list.map(p => ({
    product: p,
    score: calculateProductRelevance(p, q)
  }));

  // Direct matches: products with a positive match score, sorted descending
  const directMatches = scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => ({
      ...item.product,
      _searchScore: item.score,
      _isDirectMatch: true
    }));

  const directIds = new Set(
    directMatches.map(p => String(p.sku || p.product_id || p.slug || '').toLowerCase())
  );

  // 2. Discover related categories, sub-categories, and brands
  const targetCategories = new Set();
  const targetSubCats = new Set();
  const targetBrands = new Set();

  directMatches.forEach(p => {
    if (p.category) targetCategories.add(p.category.trim().toLowerCase());
    if (p.sub_category) targetSubCats.add(p.sub_category.trim().toLowerCase());
    if (p.brand) targetBrands.add(p.brand.trim().toLowerCase());
  });

  // If no direct matches, check if query matches any category or concept synonym
  const qTokens = tokenizeQuery(q);
  qTokens.forEach(t => {
    const checkTerms = [t, ...(CONCEPT_SYNONYMS[t] || [])];
    checkTerms.forEach(term => {
      const termNorm = normalizeSearchText(term);
      list.forEach(p => {
        if (p.category && normalizeSearchText(p.category).includes(termNorm)) {
          targetCategories.add(p.category.trim().toLowerCase());
        }
        if (p.sub_category && normalizeSearchText(p.sub_category).includes(termNorm)) {
          targetSubCats.add(p.sub_category.trim().toLowerCase());
        }
      });
    });
  });

  // 3. Find related products (strictly those sharing category or brand, excluding direct matches)
  const relatedList = [];
  list.forEach(p => {
    const id = String(p.sku || p.product_id || p.slug || '').toLowerCase();
    if (directIds.has(id)) return; // Exclude direct matches

    let relScore = 0;
    const cat = (p.category || "").trim().toLowerCase();
    const sub = (p.sub_category || "").trim().toLowerCase();
    const brand = (p.brand || "").trim().toLowerCase();

    // Priority: Same sub-category > same category > same brand
    let hasCategoryOrBrandMatch = false;
    if (sub && targetSubCats.has(sub)) {
      relScore += 60;
      hasCategoryOrBrandMatch = true;
    }
    if (cat && targetCategories.has(cat)) {
      relScore += 40;
      hasCategoryOrBrandMatch = true;
    }
    if (brand && targetBrands.has(brand)) {
      relScore += 25;
      hasCategoryOrBrandMatch = true;
    }

    // Only add if there is an actual semantic relationship (category/sub/brand)!
    if (hasCategoryOrBrandMatch && relScore > 0) {
      // Stock preference
      if (Number(p.stock !== undefined ? p.stock : 25) > 0) relScore += 5;

      relatedList.push({
        product: {
          ...p,
          _relatedScore: relScore,
          _isDirectMatch: false
        },
        relScore
      });
    }
  });

  // Sort related products descending by relevance
  relatedList.sort((a, b) => b.relScore - a.relScore);
  const relatedProducts = relatedList.map(item => item.product);

  const allResults = [...directMatches, ...relatedProducts];

  return {
    directMatches,
    relatedProducts,
    allResults,
    query: q,
    totalCount: allResults.length
  };
}

export const SearchService = {
  name: "SearchService",
  search: searchProducts,
  calculateRelevance: calculateProductRelevance,
  tokenize: tokenizeQuery,
  normalize: normalizeSearchText,
  handle(action, payload) {
    if (action === "search") {
      return { success: true, service: "SearchService", data: searchProducts(payload.products, payload.query, payload.options) };
    }
    return { success: true, service: "SearchService", action, payload };
  }
};

export default SearchService;
