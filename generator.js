const GEMINI_KEYS = [
  "AIzaSyBlZIS3itLL5cTlPuiCu2U3BWUWxfVKn2o",
  "AIzaSyDcOQSYC8Xo9xZ8cA-OmTZTK8u5Cnr-2zA",
  "AIzaSyCuNwLJzlpdOqQ45tN4vioT0Up74Ii_ZBY",
  "AIzaSyDQWNaY880Gd3guUi3BkvXPLjiVJBWojHU"
];

let objects = [];
let levelName = "";

async function generateLevel() {
  objects = [];
  let keyIndex = 0; // RESET every generation
  const prompt = document.getElementById("prompt").value;

  let plan;
  try {
    plan = await callGemini(prompt, keyIndex);
  } catch (e) {
    console.warn("Gemini failed, using fallback level.");
    plan = {
      name: "Fallback Level",
      sections: [
        { type: "cube", length: 10 },
        { type: "ship", length: 12 },
        { type: "ball", length: 10 },
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

async function callGemini(userPrompt, keyIndex) {
  const systemPrompt = `
Return ONLY valid JSON.
No markdown.
No explanation.

{
  "name": "Level Name",
  "sections": [
    { "type": "cube|ship|ball|ufo|wave", "length": 5-20 }
  ]
}
`;

  while (keyIndex < GEMINI_KEYS.length) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEYS[keyIndex]}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              role: "user",
              parts: [{
                text: systemPrompt + "\nPrompt: " + userPrompt
              }]
            }]
          })
        }
      );

      if (!res.ok) throw new Error("HTTP " + res.status);

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      console.log("Gemini raw output:", text);

      return JSON.parse(text);
    } catch (err) {
      console.warn("Gemini key failed, rotating:", err.message);
      keyIndex++;
    }
  }

  throw new Error("All Gemini API keys failed.");
}

function buildLevel(plan) {
  let x = 15;

  // Player start
  addObject(31, x, 105);
  x += 60;

  plan.sections.forEach(section => {
    addPortal(section.type, x);
    x += 45;

    for (let i = 0; i < section.length; i++) {
      addObject(1, x, 90); // block

      if (Math.random() < 0.45)
        addObject(8, x, 120); // spike

      if (Math.random() < 0.2)
        addObject(36, x, 150); // orb

      x += 30;
    }
  });
}

function addPortal(type, x) {
  const portalIds = {
    cube: 12,
    ship: 13,
    ball: 47,
    ufo: 111,
    wave: 660
  };
  addObject(portalIds[type] || 12, x, 105);
}

function addObject(id, x, y) {
  objects.push(`1,${id},2,${x},3,${y};`);
}

function exportGMD() {
  const xml =
`<?xml version="1.0"?>
<plist version="1.0">
<dict>
<key>kCEK</key>
<string>${objects.join("")}</string>
<key>k2</key>
<string>${levelName}</string>
<key>k4</key><integer>1</integer>
</dict>
</plist>`;

  const blob = new Blob([xml], { type: "application/xml" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = levelName.replace(/\s+/g, "_") + ".gmd";
  a.click();
}
