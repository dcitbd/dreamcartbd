/**
 * ============================================================================
 * DREAM CART BD — AUTHENTICATION & RBAC PERMISSION ENGINE (AuthService.js)
 * ============================================================================
 */

const AuthService = {
  // পাসওয়ার্ড হ্যাশ মেথড (SHA-256 + Secret Salt)
  hashPassword: function(password) {
    const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password + CONFIG.JWT_SECRET);
    return rawHash.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  },

  // সুরক্ষিত JWT টোকেন জেনারেটর
  generateToken: function(user) {
    const header = Utilities.base64Encode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = Utilities.base64Encode(JSON.stringify({
      userId: user.user_id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      userType: user.user_type,
      exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // ৭ দিনের ভ্যালিডিটি
    }));
    const signature = Utilities.base64Encode(Utilities.computeHmacSha256Signature(`${header}.${payload}`, CONFIG.JWT_SECRET));
    return `${header}.${payload}.${signature}`;
  },

  // টোকেন ভ্যালিডেশন মেথড
  verifyToken: function(token) {
    if (!token) throw new Error("No authorization token provided.");
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid authorization token format.");

    const expectedSig = Utilities.base64Encode(Utilities.computeHmacSha256Signature(`${parts[0]}.${parts}`, CONFIG.JWT_SECRET));
    if (expectedSig !== parts) throw new Error("Invalid token signature.");

    const payload = JSON.parse(Utilities.newBlob(Utilities.base64Decode(parts)).getDataAsString());
    if (Date.now() > payload.exp) throw new Error("Token has expired. Please log in again.");

    return payload;
  },

  // লগইন মেথড (ইমেইল অথবা ফোন নম্বর দিয়ে)
  login: function(identifier, password) {
    const users = Database.getAllRows("Users");
    const hash = this.hashPassword(password);

    const user = users.find(u => (u.email === identifier || u.phone === identifier) && u.password_hash === hash);
    if (!user) {
      throw new Error("ভুল ফোন নম্বর/ইমেইল অথবা পাসওয়ার্ড দেওয়া হয়েছে।");
    }
    if (user.status !== "active") {
      throw new Error("আপনার একাউন্টটি সাময়িকভাবে স্থগিত আছে। সাপোর্টে যোগাযোগ করুন।");
    }

    const token = this.generateToken(user);
    return {
      token: token,
      user: {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        userType: user.user_type
      }
    };
  },

  // নতুন ইউজার রেজিস্ট্রেশন
  register: function(data) {
    if (!data.phone || !data.password || !data.name) {
      throw new Error("নাম, ফোন নম্বর এবং পাসওয়ার্ড আবশ্যক।");
    }

    const users = Database.getAllRows("Users");
    if (users.some(u => u.phone === data.phone || (data.email && u.email === data.email))) {
      throw new Error("এই ফোন নম্বর বা ইমেইল দিয়ে ইতোমধ্যে একটি একাউন্ট তৈরি করা আছে।");
    }

    const userId = "USR-" + Utilities.getUuid().substring(0, 8);
    const newUser = {
      user_id: userId,
      name: data.name,
      email: data.email || "",
      phone: data.phone,
      password_hash: this.hashPassword(data.password),
      user_type: data.userType || "customer",
      role: data.role || "customer",
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    Database.insertRow("Users", newUser);
    const token = this.generateToken(newUser);

    return {
      token: token,
      user: {
        userId: newUser.user_id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        userType: newUser.user_type
      }
    };
  }
};
