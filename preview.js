function renderPreview(objects) {
  const canvas = document.getElementById("preview");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let x = 10;
  objects.forEach(obj => {
    ctx.fillStyle = "#0ff";
    ctx.fillRect(x, 100, 20, 20);
    x += 15;
  });
}
