// ================== 🔊 دالة النطق (دايم شغالة) ==================
function speak(text) {
  window.speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "ar-SA";
  msg.rate = 1;
  window.speechSynthesis.speak(msg);
}

// ================== نطق عند تحميل الصفحة ==================
window.onload = () => {
  speak("مرحبًا بك في نظام كشف التصيد الاحتيالي. أدخل الرسالة لتحليلها.");
};

// ================== نطق عند المرور أو التركيز ==================
const messageBox = document.getElementById("message");
const analyzeBtn = document.getElementById("analyzeBtn");

messageBox.addEventListener("mouseenter", () => {
  speak("هذا مربع إدخال الرسالة. ضع هنا نص الرسالة أو الرابط.");
});

messageBox.addEventListener("focus", () => {
  speak("أنت الآن داخل مربع إدخال الرسالة.");
});

analyzeBtn.addEventListener("mouseenter", () => {
  speak("زر تحليل الرسالة.");
});

analyzeBtn.addEventListener("focus", () => {
  speak("زر تحليل الرسالة. اضغط Enter للتنفيذ.");
});

// ================== إرسال الرسالة للسيرفر ==================
async function checkMessage() {
  const text = messageBox.value;

  if (!text.trim()) {
    speak("الرجاء إدخال رسالة قبل التحليل.");
    return;
  }

  const response = await fetch("http://localhost:3000/check", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text })
  });

  const data = await response.json();

  document.getElementById("status").innerText = data.status;
  document.getElementById("technique").innerText = data.technique;
  document.getElementById("description").innerText = data.description;
  document.getElementById("reason").innerText = data.reason;

  // ================== نطق النتيجة للمستخدم ==================
  speak(
    `نتيجة التحليل هي: ${data.status}.
     نوع الهجوم حسب إطار مايتر أتاك هو: ${data.technique}.
     وصف العملية: ${data.description}.`
  );
}
