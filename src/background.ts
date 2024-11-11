chrome.runtime.onConnect.addListener(function (port) {
  console.log("Conectado al puerto:", port.name);

  port.onMessage.addListener(function (msg) {
    const { products, currentPage } = msg;

    switch (msg.cmd) {
      case "scraped":
        // Guarda los productos iniciales y solicita la siguiente página
        chrome.storage.local.get(["products"], (result) => {
          const existingProducts = result.products || [];
          const updatedProducts = [...existingProducts, ...products];

          chrome.storage.local.set({ products: updatedProducts }).then(() => {
            console.log(`Productos acumulados: ${updatedProducts.length}`);

            // Envía el siguiente comando para continuar el scraping
            port.postMessage({ cmd: "scrap-next-page" });
          });
        });
        break;

      case "next-page":
        // Cuando se recibe la orden de ir a la siguiente página
        chrome.storage.local.get(["products"], (result) => {
          const existingProducts = result.products || [];
          const updatedProducts = [...existingProducts, ...products];

          chrome.storage.local.set({ products: updatedProducts }).then(() => {
            console.log(
              `Productos acumulados después de la página ${currentPage}: ${updatedProducts.length}`
            );
            // Envía la orden para continuar con la siguiente página
            port.postMessage({ cmd: "scrap-next-page" });
          });
        });
        break;

      case "finish-scrap":
        // Cuando se llega al final del scraping
        console.log("Scraping finalizado.");
        chrome.storage.local.get(["products"], (result) => {
          const finalProducts = result.products || [];
          console.log("Total de productos recolectados:", finalProducts.length);
          // Aquí puedes manejar el almacenamiento o procesar los productos recolectados
        });
        break;

      case "get-products":
        // Obtiene todos los productos almacenados
        chrome.storage.local.get(["products"], (result) => {
          port.postMessage({
            cmd: "result-products",
            result,
          });
        });
        break;

      default:
        console.log("Comando desconocido:", msg.cmd);
        break;
    }
  });
});
