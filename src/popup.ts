const buttonScrapt = document.getElementById("btn-scrap");
const buttonProducts = document.getElementById("btn-product");
const port = chrome.runtime.connect({ name: "background" });

buttonScrapt?.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  if (tab?.id == null) return;
  const response = await chrome.tabs.sendMessage(tab?.id, { cmd: "scrap" });
});

buttonProducts?.addEventListener("click", async () => {
  port.postMessage({ cmd: "get-products" });
});

port.onMessage.addListener(function (msg) {
  if (msg.cmd === "result-products") {
    const { result } = msg;
    const txtData = document.getElementById("txt-data");
    if (txtData != null) txtData.innerText = JSON.stringify(result, null, 2);
  }
});
