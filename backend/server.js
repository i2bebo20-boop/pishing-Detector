const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 ربط الواجهة (frontend)
app.use(express.static(path.join(__dirname, "../frontend")));

// 🔹 الصفحة الرئيسية
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ================== LOGIC ==================

// كلمات خطيرة (High Risk)
const criticalWords = [
  "إيقاف","ايقاف","حسابك موقوف","تعليق",
  "تحذير","عاجل","انذار","تم اختراق",
  "تم تعطيل","إغلاق الحساب","blocked",
  "suspended","locked","security alert"
];

// كلمات مشبوهة (Medium Risk)
const suspiciousWords = [
  "otp","رمز التحقق","password","passcode",
  "دعم فني","support","bank","بنك",
  "تحديث بياناتك","login","verify",
  "confirm","account","secure","identity"
];

// MITRE ATT&CK Mapping
const mitreMap = [
  { k:["login","تسجيل الدخول"], id:"T1566.002", desc:"Phishing Link" },
  { k:["otp","رمز التحقق"], id:"T1556", desc:"Credential Harvesting" },
  { k:["support","دعم فني"], id:"T1566", desc:"Social Engineering" },
  { k:["bank","بنك"], id:"T1656", desc:"Financial Phishing" }
];

// ================== API ==================
app.post("/scan", (req, res) => {

  const text = (req.body.text || "").toLowerCase();
  let risk = 0;
  let mitre = [];
  let reasons = [];

  // كشف الروابط
  const hasLink = /(http|https|www\.)/.test(text);
  if (hasLink) {
    risk += 2;
    reasons.push("يحتوي على رابط");
  }

  // كلمات خطيرة
  criticalWords.forEach(w => {
    if (text.includes(w)) {
      risk += 3;
      reasons.push(`كلمة خطيرة: ${w}`);
    }
  });

  // كلمات مشبوهة
  suspiciousWords.forEach(w => {
    if (text.includes(w)) {
      risk += 1;
      reasons.push(`كلمة مشبوهة: ${w}`);
    }
  });

  // MITRE Mapping
  mitreMap.forEach(m => {
    m.k.forEach(word => {
      if (text.includes(word)) {
        mitre.push(`${m.id} - ${m.desc}`);
      }
    });
  });

  // إزالة التكرار
  mitre = [...new Set(mitre)];

  // تحديد النتيجة
  let result = "آمنة";
  if (risk >= 6) result = "🚨 احتيالية";
  else if (risk >= 3) result = "⚠️ مشبوهة";

  // حفظ في قاعدة البيانات
  db.run(
    "INSERT INTO scans (text, risk, result, mitre) VALUES (?,?,?,?)",
    [text, risk, result, mitre.join(", ")]
  );

  res.json({
    risk,
    result,
    reasons,
    mitre
  });
});

// ================== تشغيل السيرفر ==================

// حل مشكلة البورت المشغول
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});