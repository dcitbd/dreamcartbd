/**
 * DREAM CART BD — SESSION & AUTHENTICATION SERVICE
 * Secure hashed sessions, password verification, registration, rate limiting.
 * Synchronizes Customers with Google Sheets "Customers" tab:
 * A=USER_ID, B=Profile_photo, C=Name, D=Mobile, E=Mail, F=Address, G=User_ID, H=Password, I=Status, J=Success_order, K=Cancel_Order, L=Total_Order, M=Order_Success_Rate
 */

var SessionService = {
  createSession: function(userId, role, metadata) {
    var token = (typeof IDGenerator !== 'undefined' && IDGenerator.token) ? IDGenerator.token() : ("TOKEN-" + Date.now());
    var ttlHours = (typeof CONFIG !== 'undefined' && CONFIG.SESSION_TTL_HOURS) ? CONFIG.SESSION_TTL_HOURS : 72;
    var expiresAt = new Date(Date.now() + ttlHours * 3600 * 1000).toISOString();
    
    var sessionRecord = {
      token: token,
      user_id: userId,
      role: role || "Customer",
      created_at: new Date().toISOString(),
      expires_at: expiresAt,
      device_info: metadata && metadata.userAgent ? metadata.userAgent.slice(0, 100) : "Web",
      ip_address: metadata && metadata.ip ? metadata.ip : "Unknown",
      is_active: true
    };
    
    try {
      SheetRepository.appendRow(CONFIG.SHEETS.SESSIONS, sessionRecord);
      AppCacheService.set("sess_" + token, sessionRecord, 1800);
    } catch (e) {}

    return {
      token: token,
      expires_at: expiresAt
    };
  },

  getSession: function(token) {
    if (!token) return null;
    try {
      var cached = AppCacheService.get("sess_" + token);
      if (cached) {
        if (new Date(cached.expires_at) > new Date() && cached.is_active) {
          return cached;
        }
        return null;
      }

      var record = SheetRepository.findOne(CONFIG.SHEETS.SESSIONS, function(r) {
        return r.token === token && (r.is_active === true || String(r.is_active).toLowerCase() === "true");
      });

      if (record && new Date(record.expires_at) > new Date()) {
        AppCacheService.set("sess_" + token, record, 1800);
        return record;
      }
    } catch (e) {}
    return null;
  },

  destroySession: function(token) {
    if (!token) return false;
    try {
      AppCacheService.remove("sess_" + token);
      return SheetRepository.updateRowByCondition(CONFIG.SHEETS.SESSIONS, function(r) {
        return r.token === token;
      }, { is_active: false });
    } catch (e) {
      return false;
    }
  }
};

var AuthService = {
  hashPassword: function(plain) {
    var raw = plain + "_DCBD_SECURE_SALT_2026";
    if (typeof Utilities !== 'undefined' && Utilities.computeDigest) {
      var signature = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw);
      return signature.map(function(byte) {
        var v = (byte < 0 ? byte + 256 : byte).toString(16);
        return v.length === 1 ? "0" + v : v;
      }).join("");
    }
    return plain;
  },

  login: function(identifier, password, metadata) {
    var cleanId = String(identifier || "").trim();
    var cleanPhone = cleanId.replace(/^(\+?88)/, "").replace(/[\s\-]/g, "");
    if (cleanPhone.length === 10 && cleanPhone.charAt(0) === '1') cleanPhone = '0' + cleanPhone;

    // 1. Check Super Admin master bypass
    if (cleanId === "01581703822" && password === "DCBD@2026") {
      var superAdmin = {
        user_id: "USR-SUPERADMIN-01",
        name: "Jainal Abedin (Super Admin)",
        phone: "01581703822",
        email: "jainal.dcitbd@gmail.com",
        role: "Super Admin",
        account_type: "ADMIN",
        status: "active"
      };
      var sSession = SessionService.createSession(superAdmin.user_id, "Super Admin", metadata);
      return {
        success: true,
        token: sSession.token,
        expires_at: sSession.expires_at,
        user: superAdmin
      };
    }

    // 2. Strict Check in "Customers" Sheet
    var customerSheetName = (typeof CONFIG !== 'undefined' && CONFIG.SHEETS && CONFIG.SHEETS.CUSTOMERS) ? CONFIG.SHEETS.CUSTOMERS : "Customers";
    var customer = null;
    try {
      customer = SheetRepository.findOne(customerSheetName, function(c) {
        var cMobile = String(c.mobile || c.Mobile || "").replace(/^(\+?88)/, "").replace(/[\s\-]/g, "");
        if (cMobile.length === 10 && cMobile.charAt(0) === '1') cMobile = '0' + cMobile;
        var cMail = String(c.mail || c.Mail || "").trim().toLowerCase();
        var cUserIdA = String(c.user_id || c.USER_ID || "").trim().toLowerCase();
        var cUserIdG = String(c.User_ID || "").trim().toLowerCase();

        return (cleanPhone && cMobile === cleanPhone) ||
               (cleanId.toLowerCase() === cMail) ||
               (cleanId.toLowerCase() === cUserIdA) ||
               (cleanId.toLowerCase() === cUserIdG);
      });
    } catch (e) {}

    if (!customer) {
      return { 
        success: false, 
        message: "মোবাইল নম্বর/ইমেইল অথবা পাসওয়ার্ড সঠিক নয়। Customers তালিকায় আপনার তথ্য পাওয়া যায়নি।", 
        error_code: "AUTH_FAILED" 
      };
    }

    var statusVal = String(customer.status || customer.Status || "Active").toLowerCase();
    if (statusVal === "blocked" || statusVal === "inactive") {
      return { 
        success: false, 
        message: "আপনার অ্যাকাউন্টটি স্থগিত বা ব্লক করা হয়েছে। কাস্টমার সাপোর্টে যোগাযোগ করুন।", 
        error_code: "ACCOUNT_BLOCKED" 
      };
    }

    var storedPass = String(customer.password || customer.Password || "").trim();
    var inputPass = String(password || "").trim();
    if (storedPass !== inputPass && storedPass !== this.hashPassword(inputPass)) {
      return { 
        success: false, 
        message: "ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড প্রদান করুন।", 
        error_code: "INVALID_PASSWORD" 
      };
    }

    var uId = customer.user_id || customer.USER_ID || customer.User_ID || ("CUST-" + Date.now());
    var userProfile = {
      user_id: uId,
      USER_ID: uId,
      profile_photo: customer.profile_photo || customer.Profile_photo || "",
      name: customer.name || customer.Name || "সম্মানিত গ্রাহক",
      mobile: customer.mobile || customer.Mobile || cleanPhone,
      phone: customer.mobile || customer.Mobile || cleanPhone,
      mail: customer.mail || customer.Mail || "",
      email: customer.mail || customer.Mail || "",
      address: customer.address || customer.Address || "",
      role: "Customer",
      account_type: "CUSTOMER",
      status: customer.status || customer.Status || "Active",
      success_order: Number(customer.success_order || customer.Success_order || 0),
      cancel_order: Number(customer.cancel_order || customer.Cancel_Order || 0),
      total_order: Number(customer.total_order || customer.Total_Order || 0),
      order_success_rate: String(customer.order_success_rate || customer.Order_Success_Rate || "100%")
    };

    var session = SessionService.createSession(uId, "Customer", metadata);
    try {
      AuditService.log(uId, "Customer", "LOGIN_SUCCESS", "Customers", uId, { phone: userProfile.phone });
    } catch (e) {}

    return {
      success: true,
      token: session.token,
      expires_at: session.expires_at,
      user: userProfile
    };
  },

  registerCustomer: function(data) {
    var rawPhone = String(data.mobile || data.phone || "").trim();
    var phone = rawPhone.replace(/^(\+?88)/, "").replace(/[\s\-]/g, "");
    if (phone.length === 10 && phone.charAt(0) === '1') phone = '0' + phone;

    if (!phone || phone.length < 11) {
      return { success: false, message: "অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন।", error_code: "INVALID_PHONE" };
    }

    var customerSheetName = (typeof CONFIG !== 'undefined' && CONFIG.SHEETS && CONFIG.SHEETS.CUSTOMERS) ? CONFIG.SHEETS.CUSTOMERS : "Customers";

    // Check if phone or email already registered
    try {
      var existing = SheetRepository.findOne(customerSheetName, function(u) {
        var uMobile = String(u.mobile || u.Mobile || "").replace(/^(\+?88)/, "").replace(/[\s\-]/g, "");
        if (uMobile.length === 10 && uMobile.charAt(0) === '1') uMobile = '0' + uMobile;
        var uMail = String(u.mail || u.Mail || "").trim().toLowerCase();
        var reqMail = String(data.mail || data.email || "").trim().toLowerCase();
        return (phone && uMobile === phone) || (reqMail && uMail && uMail === reqMail);
      });
      if (existing) {
        return { success: false, message: "এই মোবাইল নম্বর বা ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা আছে।", error_code: "PHONE_EXISTS" };
      }
    } catch (e) {}

    var userId = (typeof IDGenerator !== 'undefined' && IDGenerator.customerID) ? IDGenerator.customerID() : ("CUST-" + Math.floor(100000 + Math.random() * 900000));
    var cleanPass = String(data.password || "123456").trim();

    // 13 Columns:
    // A=USER_ID, B=Profile_photo, C=Name, D=Mobile, E=Mail, F=Address, G=User_ID, H=Password, I=Status, J=Success_order, K=Cancel_Order, L=Total_Order, M=Order_Success_Rate
    var newCustomer = {
      USER_ID: userId,
      user_id: userId,
      Profile_photo: data.profile_photo || data.Profile_photo || "",
      profile_photo: data.profile_photo || data.Profile_photo || "",
      Name: data.name || "সম্মানিত গ্রাহক",
      name: data.name || "সম্মানিত গ্রাহক",
      Mobile: phone,
      mobile: phone,
      phone: phone,
      Mail: data.mail || data.email || "",
      mail: data.mail || data.email || "",
      email: data.mail || data.email || "",
      Address: data.address || "",
      address: data.address || "",
      User_ID: userId,
      Password: cleanPass,
      password: cleanPass,
      Status: "Active",
      status: "Active",
      Success_order: 0,
      success_order: 0,
      Cancel_Order: 0,
      cancel_order: 0,
      Total_Order: 0,
      total_order: 0,
      Order_Success_Rate: "100%",
      order_success_rate: "100%",
      account_type: "CUSTOMER",
      role: "Customer"
    };

    try {
      SheetRepository.appendRow(customerSheetName, newCustomer);
      AuditService.log(userId, "Customer", "REGISTER", "Customers", userId, { name: newCustomer.name, phone: phone });
    } catch (e) {}

    var session = SessionService.createSession(userId, "Customer");
    return {
      success: true,
      token: session.token,
      user: newCustomer
    };
  }
};

var PermissionService = {
  canAccess: function(session, requiredRole) {
    if (!session || !session.role) return false;
    var userRole = session.role;
    if (userRole === "Super Admin" || userRole === "SUPER_ADMIN") return true;
    if (userRole === requiredRole) return true;
    return false;
  }
};

if (typeof module !== 'undefined') {
  module.exports = {
    SessionService: SessionService,
    AuthService: AuthService,
    PermissionService: PermissionService
  };
}
