const GEMINI_KEYS = [
  "AIzaSyBlZIS3itLL5cTlPuiCu2U3BWUWxfVKn2o",
  "AIzaSyDcOQSYC8Xo9xZ8cA-OmTZTK8u5Cnr-2zA",
  "AIzaSyCuNwLJzlpdOqQ45tN4vioT0Up74Ii_ZBY",
  "AIzaSyDQWNaY880Gd3guUi3BkvXPLjiVJBWojHU"
];

let objects = [];
let levelName = "AI Level";

/* ======================
   MAIN
====================== */

async function generateLevel() {
  objects = [];
  const prompt = document.getElementById("prompt").value;

  let plan;
  try {
    plan = await callGemini(prompt);
  } catch {
    plan = {
      name: "Fallback Level",
      sections: [
        { type: "cube", length: 10 },
        { type: "ship", length: 12 },
        { type: "wave", length: 14 }
      ]
    };
  }

  levelName = plan.name || "AI Level";
  buildLevel(plan);

  document.getElementById("levelName").innerText =
    "Level Name: " + levelName;
  document.getElementById("objectCount").innerText =
    "Objects: " + objects.length;
  document.getElementById("exportBtn").disabled = false;

  renderPreview(objects);
}

/* ======================
   GEMINI
====================== */

async function callGemini(userPrompt) {
  const systemPrompt = `
Return ONLY valid JSON.
{
  "name": "Level Name",
  "sections": [
    { "type": "cube|ship|ball|ufo|wave", "length": 5-20 }
  ]
}
`;

  for (let i = 0; i < GEMINI_KEYS.length; i++) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEYS[i]}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              role: "user",
              parts: [{ text: systemPrompt + "\nPrompt: " + userPrompt }]
            }]
          })
        }
      );

      if (!res.ok) throw new Error();

      const data = await res.json();
      return JSON.parse(data.candidates[0].content.parts[0].text);
    } catch {}
  }

  throw new Error("All Gemini keys failed");
}

/* ======================
   LEVEL BUILD
====================== */

function buildLevel(plan) {
  let x = 15;

  addObject(31, x, 105); // start
  x += 60;

  plan.sections.forEach(section => {
    addPortal(section.type, x);
    x += 45;

    for (let i = 0; i < section.length; i++) {
      addObject(1, x, 90);      // block
      if (Math.random() < 0.45) addObject(8, x, 120); // spike
      if (Math.random() < 0.2)  addObject(36, x, 150); // orb
      x += 30;
    }
  });
}

function addPortal(type, x) {
  const ids = { cube: 12, ship: 13, ball: 47, ufo: 111, wave: 660 };
  addObject(ids[type] || 12, x, 105);
}

function addObject(id, x, y) {
  objects.push(`1,${id},2,${x},3,${y};`);
}

/* ======================
   EXPORT (.gmd)
====================== */

function exportGMD() {
  const levelString = objects.join("");
  const encoded = encodeLevel(levelString);

  const xml =
`<?xml version="1.0"?>
<plist version="1.0">
<dict>
<key>kCEK</key>
<string>${encoded}</string>

<key>k2</key>
<string>${levelName}</string>

<!-- Song -->
<key>k8</key><integer>0</integer>
<key>k45</key><integer>0</integer>
<key>k46</key><string>Stereo Madness</string>

<key>k4</key><integer>1</integer>
</dict>
</plist>`;

  const blob = new Blob([xml], { type: "application/xml" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = levelName.replace(/\s+/g, "_") + ".gmd";
  a.click();
}

/* ======================
   ENCODING (CRITICAL)
====================== */

function encodeLevel(str) {
  const utf8 = new TextEncoder().encode(str);
  const compressed = pako.gzip(utf8);
  return btoa(String.fromCharCode(...compressed));
}
