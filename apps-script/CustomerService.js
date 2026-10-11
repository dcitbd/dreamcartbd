/**
 * DREAM CART BD — CUSTOMER SERVICE
 * Synchronizes customer accounts with Google Sheets "Customers" tab.
 * Columns: A=USER_ID, B=Profile_photo, C=Name, D=Mobile, E=Mail, F=Address, G=User_ID, H=Password, I=Status, J=Success_order, K=Cancel_Order, L=Total_Order, M=Order_Success_Rate
 */

var CustomerService = {
  getProfile: function(cId) {
    if (!cId) return null;
    var cleanId = String(cId).trim().toLowerCase();
    return SheetRepository.findOne(CONFIG.SHEETS.CUSTOMERS, function(u) {
      return String(u.user_id || u.USER_ID || u.User_ID || "").toLowerCase() === cleanId ||
             String(u.mobile || u.Mobile || "").replace(/\D/g, "") === cleanId.replace(/\D/g, "") ||
             String(u.mail || u.Mail || "").toLowerCase() === cleanId;
    });
  },

  getOrders: function(phoneOrId) {
    if (!phoneOrId) return [];
    var clean = String(phoneOrId).trim().replace(/\D/g, "");
    return SheetRepository.findRows(CONFIG.SHEETS.ORDERS, function(o) {
      var oPhone = String(o.phone || o.Phone || "").replace(/\D/g, "");
      return oPhone && (oPhone.includes(clean) || clean.includes(oPhone));
    });
  }
};

if (typeof module !== 'undefined') module.exports = CustomerService;
