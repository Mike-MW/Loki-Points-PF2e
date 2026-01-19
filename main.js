Hooks.on("ready", async () => {
  for (const actor of game.actors) {
    if (actor.type !== "character") continue;
    if (actor.system?.resources?.lokiPoints) continue;

    await actor.update({
        "system.resources.lokiPoints": {
            label: "Loki Points",
            value: 0,
            max: 3,
            icon: "modules/lokipoints/Icons/LPIcon.png"
        }
    });
  }
});
Hooks.on("renderActorSheetPF2e", (app, html) => {
  // Only characters
  if (app.actor?.type !== "character") return;

  const selector = '[data-action="adjust-resource"][data-resource="lokiPoints"]';

  // Left click = +1, Right click = -1
  html.find(selector).on("mousedown", async (event) => {
    event.preventDefault();

    const actor = app.actor;
    const res = actor.system?.resources?.lokiPoints;
    if (!res) return;

    const value = Number(res.value ?? 0);
    const max = Number(res.max ?? 3);

    let next = value;
    if (event.button === 0) next = Math.min(max, value + 1);      // left
    if (event.button === 2) next = Math.max(0, value - 1);        // right
    if (next === value) return;

    await actor.update({ "system.resources.lokiPoints.value": next });
  });

  // Stop the browser right-click menu on that widget
  html.find(selector).on("contextmenu", (event) => event.preventDefault());
});


Hooks.on("renderActorSheetPF2e", (app, html) => {
  if (app.actor?.type !== "character") return;

  // Don't double-insert
  if (html.find('[data-resource="lokiPoints"]').length) return;

  // Find the header dots row (the existing hero points row)
  const headerDots = html.find("header.char-header section.char-details .dots").first();
  if (!headerDots.length) return;

  const lp = app.actor.system?.resources?.lokiPoints;
  if (!lp) return;

  const max = Number(lp.max ?? 3);
  const value = Number(lp.value ?? 0);
  const icon = String(lp.icon ?? "");

  const lokiDots = $(`<div class="dots loki-points"></div>`);
  lokiDots.append(`<span class="label">Loki Points</span>`);

  const clickSpan = $(`<span data-action="adjust-resource" data-resource="lokiPoints"></span>`);
  for (let i = 0; i < max; i++) {
    if (value > i) clickSpan.append(`<img src="${icon}" class="loki-dot">`);
    else clickSpan.append(`<i class="fa-regular fa-circle"></i>`);
  }
  lokiDots.append(clickSpan);

  // Insert right after the existing dots row
  headerDots.after(lokiDots);
});
Hooks.on("renderActorSheetPF2e", (app, html) => {
  if (app.actor?.type !== "character") return;

  // Delegate: works even for injected elements
  html.off("mousedown.loki").on("mousedown.loki", '[data-resource="lokiPoints"]', async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const actor = app.actor;
    const res = actor.system?.resources?.lokiPoints;
    if (!res) return;

    const value = Number(res.value ?? 0);
    const max = Number(res.max ?? 3);

    let next = value;
    if (event.button === 0) next = Math.min(max, value + 1); // left
    if (event.button === 2) next = Math.max(0, value - 1);   // right
    if (next === value) return;

    await actor.update({ "system.resources.lokiPoints.value": next });
  });

  html.off("contextmenu.loki").on("contextmenu.loki", '[data-resource="lokiPoints"]', (event) => {
    event.preventDefault();
    event.stopPropagation();
  });
});