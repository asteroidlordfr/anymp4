let levelString = "";
let objects = [];

function generateLevel() {
  objects = [];
  let x = 30;

  const prompt = document.getElementById("prompt").value.toLowerCase();
  const name = generateName();

  addStart();

  addSection("cube", 10);
  if (prompt.includes("ship")) addSection("ship", 12);
  if (prompt.includes("ball")) addSection("ball", 12);
  if (prompt.includes("ufo")) addSection("ufo", 12);
  if (prompt.includes("wave")) addSection("wave", 15);

  levelString = objects.join("");
  document.getElementById("levelName").innerText = "Level Name: " + name;
  document.getElementById("objectCount").innerText = "Objects: " + objects.length;
  document.getElementById("exportBtn").disabled = false;

  renderPreview(objects);
}

function generateName() {
  const names = ["Pulse", "Overdrive", "Neon Rift", "Velocity", "Apex"];
  return names[Math.floor(Math.random() * names.length)];
}

function addStart() {
  objects.push("1,31,2,15,3,105;");
}

function addSection(type, length) {
  addPortal(type);
  let y = 90;
  for (let i = 0; i < length; i++) {
    objects.push(`1,1,2,${30 + objects.length * 30},3,${y};`);
    if (Math.random() < 0.5)
      objects.push(`1,8,2,${30 + objects.length * 30},3,${y + 30};`);
  }
}

function addPortal(type) {
  const portals = {
    cube: 12,
    ship: 13,
    ball: 47,
    ufo: 111,
    wave: 660
  };
  objects.push(`1,${portals[type]},2,${30 + objects.length * 30},3,105;`);
}

function exportGMD() {
  const xml =
`<?xml version="1.0"?>
<plist version="1.0">
<dict>
<key>kCEK</key>
<string>${levelString}</string>
<key>k2</key>
<string>AI Level</string>
<key>k4</key><integer>1</integer>
</dict>
</plist>`;

  const blob = new Blob([xml], { type: "application/xml" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "AI_Level.gmd";
  a.click();
}
