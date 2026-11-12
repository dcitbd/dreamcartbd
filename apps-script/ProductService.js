/**
 * Dream Cart BD - Product Service (Apps Script Backend)
 * Handles product creation, update, deletion, and duplicate-entry prevention.
 */

var ProductService = (function() {

  var SHEET_NAME = "Products";

  /**
   * নতুন পণ্য যোগ করা (ডাবল এন্ট্রি বা ডুপ্লিকেট সাবমিশন প্রতিরোধক সহ)
   * @param {Object} productData
   * @returns {Object}
   */
  function createProduct(productData) {
    if (!productData) {
      throw new Error("পণ্যের তথ্য পাওয়া যায়নি।");
    }

    var productName = String(productData.name || productData.title || "").trim();
    var productPrice = Number(productData.price || productData.sellingPrice || 0);
    var productCategory = String(productData.category || "").trim();
    var sku = String(productData.sku || productData.code || "").trim();

    if (!productName) {
      throw new Error("পণ্যের নাম প্রদান করা আবশ্যক।");
    }

    // ১. ডাবল সাবমিশন রোধ করার জন্য ইউনিক সিগনেচার তৈরি (৫ সেকেন্ডের ক্যাশ গার্ড)
    var dedupKey = "PROD_DEDUP_" + Utilities.base64EncodeWebSafe(
      productName.toLowerCase() + "_" + productPrice + "_" + productCategory.toLowerCase() + "_" + sku
    ).slice(0, 60);

    var cache = CacheService.getScriptCache();
    if (cache.get(dedupKey)) {
      // যদি ৫ সেকেন্ডের মধ্যে হুবহু একই প্রোডাক্টের দ্বিতীয় রিকোয়েস্ট আসে, তবে দ্বিতীয়বার শীটে সেভ না করে আগের রেসপন্স রিটার্ন করবে
      var cachedProduct = JSON.parse(cache.get(dedupKey));
      return {
        success: true,
        duplicatePrevented: true,
        message: "পণ্যটি সফলভাবে যুক্ত হয়েছে!",
        product: cachedProduct
      };
    }

    // ২. কনকারেন্ট রিকোয়েস্ট আটকাতে ScriptLock ব্যবহার
    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(5000);
    } catch (e) {
      throw new Error("সার্ভার ব্যস্ত, অনুগ্রহ করে একটু পর আবার চেষ্টা করুন।");
    }

    try {
      // লক পাওয়ার পর পুনরায় ক্যাশ চেক (যাতে একই সময়ে আসা দুটি থ্রেডের দ্বিতীয়টি ডাবল রাইট না করে)
      if (cache.get(dedupKey)) {
        var existingProduct = JSON.parse(cache.get(dedupKey));
        return {
          success: true,
          duplicatePrevented: true,
          message: "পণ্যটি সফলভাবে যুক্ত হয়েছে!",
          product: existingProduct
        };
      }

      var productId = productData.id || productData.productId || (
        (typeof IDGenerator !== "undefined" && IDGenerator.generateProductId)
          ? IDGenerator.generateProductId()
          : "PRD-" + new Date().getTime()
      );

      var now = new Date().toISOString();

      var newProduct = {
        id: productId,
        productId: productId,
        sku: sku || productId,
        name: productName,
        title: productName,
        category: productCategory || "Uncategorized",
        brand: String(productData.brand || "").trim(),
        buyingPrice: Number(productData.buyingPrice || productData.costPrice || 0),
        originalPrice: Number(productData.originalPrice || productData.regularPrice || productPrice),
        price: productPrice,
        sellingPrice: productPrice,
        wholesalePrice: Number(productData.wholesalePrice || 0),
        resellerPrice: Number(productData.resellerPrice || 0),
        stock: Number(productData.stock !== undefined ? productData.stock : 10),
        image: productData.image || productData.thumbnail || "",
        images: Array.isArray(productData.images) ? productData.images : (productData.image ? [productData.image] : []),
        description: String(productData.description || "").trim(),
        variants: productData.variants || [],
        status: productData.status || "Active",
        featured: Boolean(productData.featured),
        createdAt: productData.createdAt || now,
        updatedAt: now
      };

      // ৩. শীটে শুধুমাত্র একবারই ডেটা সেভ করা নিশ্চিতকরণ (কোনো ডাবল কল হবে না)
      var saved = false;
      if (typeof SheetRepository !== "undefined" && typeof SheetRepository.saveProduct === "function") {
        SheetRepository.saveProduct(newProduct);
        saved = true;
      } else if (typeof Database !== "undefined" && typeof Database.insert === "function") {
        Database.insert(SHEET_NAME, newProduct);
        saved = true;
      }

      if (!saved) {
        saveDirectlyToSheet(newProduct);
      }

      // ৪. ক্যাশে ১৫ সেকেন্ডের জন্য প্রোডাক্টটি লক করে রাখা যেন ডাবল ক্লিক বা রিট্রাইয়ে ডুপ্লিকেট না হয়
      cache.put(dedupKey, JSON.stringify(newProduct), 15);

      // ৫. প্রোডাক্ট লিস্টের ক্যাশ ক্লিয়ার করা যাতে সাথে সাথে নতুন প্রোডাক্ট দেখা যায়
      clearProductListCache();

      return {
        success: true,
        message: "পণ্যটি সফলভাবে যুক্ত হয়েছে!",
        productId: productId,
        product: newProduct
      };

    } finally {
      lock.releaseLock();
    }
  }

  /**
   * সকল পণ্যের তালিকা উত্তোলন (ফাস্ট ক্যাশ সাপোর্টসহ)
   * @param {Object} filters
   * @returns {Array}
   */
  function getProducts(filters) {
    var list = [];
    if (typeof SheetRepository !== "undefined" && typeof SheetRepository.getProducts === "function") {
      list = SheetRepository.getProducts(filters) || [];
    } else if (typeof Database !== "undefined" && typeof Database.findAll === "function") {
      list = Database.findAll(SHEET_NAME) || [];
    } else {
      list = readDirectlyFromSheet();
    }

    if (filters && filters.category) {
      var cat = String(filters.category).toLowerCase();
      list = list.filter(function(item) {
        return String(item.category || "").toLowerCase() === cat;
      });
    }

    if (filters && filters.status) {
      var st = String(filters.status).toLowerCase();
      list = list.filter(function(item) {
        return String(item.status || "active").toLowerCase() === st;
      });
    }

    return list;
  }

  /**
   * নির্দিষ্ট একটি পণ্যের তথ্য উত্তোলন
   * @param {string} productId
   * @returns {Object|null}
   */
  function getProductById(productId) {
    if (!productId) return null;
    var products = getProducts();
    for (var i = 0; i < products.length; i++) {
      if (String(products[i].id) === String(productId) || String(products[i].productId) === String(productId)) {
        return products[i];
      }
    }
    return null;
  }

  /**
   * পণ্য আপডেট করা
   * @param {string} productId
   * @param {Object} updateData
   * @returns {Object}
   */
  function updateProduct(productId, updateData) {
    var id = productId || (updateData && (updateData.id || updateData.productId));
    if (!id) {
      throw new Error("পণ্য আপডেট করার জন্য Product ID প্রয়োজন।");
    }

    updateData.updatedAt = new Date().toISOString();

    if (typeof SheetRepository !== "undefined" && typeof SheetRepository.updateProduct === "function") {
      SheetRepository.updateProduct(id, updateData);
    } else if (typeof Database !== "undefined" && typeof Database.update === "function") {
      Database.update(SHEET_NAME, id, updateData);
    }

    clearProductListCache();

    return {
      success: true,
      message: "পণ্যের তথ্য সফলভাবে আপডেট করা হয়েছে।",
      productId: id
    };
  }

  /**
   * পণ্য ডিলিট করা
   * @param {string} productId
   * @returns {Object}
   */
  function deleteProduct(productId) {
    if (!productId) {
      throw new Error("পণ্য মুছে ফেলার জন্য Product ID প্রয়োজন।");
    }

    if (typeof SheetRepository !== "undefined" && typeof SheetRepository.deleteProduct === "function") {
      SheetRepository.deleteProduct(productId);
    } else if (typeof Database !== "undefined" && typeof Database.remove === "function") {
      Database.remove(SHEET_NAME, productId);
    }

    clearProductListCache();

    return {
      success: true,
      message: "পণ্যটি সফলভাবে মুছে ফেলা হয়েছে।",
      productId: productId
    };
  }

  /**
   * ফলব্যাক: সরাসরি শীটে প্রোডাক্ট সংরক্ষণ (যদি রিপোজিটরি ফাংশন অনুপস্থিত থাকে)
   */
  function saveDirectlyToSheet(product) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        "id", "sku", "name", "category", "brand",
        "buyingPrice", "originalPrice", "price", "wholesalePrice", "resellerPrice",
        "stock", "image", "description", "status", "createdAt", "updatedAt"
      ]);
    }

    sheet.appendRow([
      product.id,
      product.sku,
      product.name,
      product.category,
      product.brand,
      product.buyingPrice,
      product.originalPrice,
      product.price,
      product.wholesalePrice,
      product.resellerPrice,
      product.stock,
      product.image,
      product.description,
      product.status,
      product.createdAt,
      product.updatedAt
    ]);
  }

  /**
   * ফলব্যাক: সরাসরি শীট থেকে প্রোডাক্ট রিড করা
   */
  function readDirectlyFromSheet() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) return [];

    var rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) return [];

    var headers = rows[0];
    var result = [];

    for (var i = 1; i < rows.length; i++) {
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = rows[i][j];
      }
      result.push(obj);
    }
    return result;
  }

  /**
   * প্রোডাক্ট ক্যাশ পরিষ্কার করা
   */
  function clearProductListCache() {
    try {
      var cache = CacheService.getScriptCache();
      cache.remove("ALL_PRODUCTS_CACHE");
    } catch (e) {}
  }

  return {
    createProduct: createProduct,
    addProduct: createProduct,
    add: createProduct,
    getProducts: getProducts,
    getAll: getProducts,
    getProductById: getProductById,
    getById: getProductById,
    updateProduct: updateProduct,
    update: updateProduct,
    deleteProduct: deleteProduct,
    remove: deleteProduct
  };

})();
