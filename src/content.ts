const port_background = chrome.runtime.connect({ name: "background" });

console.log("Content script loaded");

// // Función para desplegar el menú
// function toggleDropdownMenu() {
//   const dropdownButton = document.querySelector(
//     "#menu-button-desktop"
//   ) as HTMLElement;

//   if (dropdownButton) {
//     console.log("✅ Menú desplegable encontrado.");
//     dropdownButton.click();
//     console.log("🖱️ Menú desplegable fue clickeado automáticamente.");
//   } else {
//     console.log("❌ No se pudo encontrar el menú desplegable.");
//   }
// }

// // Función para hacer clic en el elemento específico dentro del menú
// function clickOnCategoryLink() {
//   const categoryLink = document.querySelector(
//     'li[data-index="1"] .textMenu[data-section="categories"]'
//   ) as HTMLElement;

//   if (categoryLink) {
//     console.log("✅ Categoría 'Tecnología' encontrada.");
//     categoryLink.click();
//     console.log("🖱️ Clic en la categoría 'Tecnología' realizado.");
//   } else {
//     console.log("❌ No se pudo encontrar la categoría 'Tecnología'.");
//   }
// }

// // Función para hacer clic en el botón "Ver todo"
// function clickOnVerTodoButton() {
//   const verTodoButton = document.querySelector(
//     "span.MainMenu__wrapper__departments__item.link-all a"
//   ) as HTMLElement;

//   if (verTodoButton) {
//     console.log("✅ Botón 'Ver todo' encontrado.");
//     verTodoButton.click();
//     console.log("🖱️ Clic en el botón 'Ver todo' realizado.");
//   } else {
//     console.log("❌ No se pudo encontrar el botón 'Ver todo'.");
//   }
// }

// // Verificamos si la categoría ya fue cargada usando `localStorage`
// if (!localStorage.getItem("categoryLoaded")) {
//   // Si no está cargada, realizamos las acciones
//   setTimeout(() => {
//     toggleDropdownMenu(); // Desplegamos el menú principal

//     // Esperamos medio segundo para asegurarnos de que el menú esté desplegado
//     setTimeout(() => {
//       clickOnCategoryLink(); // Hacemos clic en la categoría 'Tecnología'

//       // Esperamos un segundo para asegurarnos de que el submenú esté abierto
//       setTimeout(() => {
//         clickOnVerTodoButton(); // Hacemos clic en el botón 'Ver todo'

//         // Marcamos que la categoría ya fue cargada
//         localStorage.setItem("categoryLoaded", "true");
//       }, 2000);
//     }, 2000);
//   }, 2000);
// } else {
//   // Si la categoría ya fue cargada, no ejecutamos nada
//   console.log(
//     "✅ La categoría 'Tecnología' ya ha sido cargada, no se repite el proceso."
//   );
// }

// Función para desplegar el menú

// Función para desplegar el menú
console.log("Ejecutando content script plaza vea 3.0");

let currentPage = 0;

function delay(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

// Función para hacer clic en el menú desplegable
function toggleDropdownMenu() {
  const dropdownButton = document.querySelector(
    "#menu-button-desktop"
  ) as HTMLElement;

  if (dropdownButton) {
    console.log("✅ Menú desplegable encontrado.");
    dropdownButton.click();
    console.log("🖱️ Menú desplegable fue clickeado automáticamente.");
  } else {
    console.log("❌ No se pudo encontrar el menú desplegable.");
  }
}

// Función para hacer clic en la categoría 'Tecnología'
function clickOnCategoryLink() {
  const categoryLink = document.querySelector(
    'li[data-index="1"] .textMenu[data-section="categories"]'
  ) as HTMLElement;

  if (categoryLink) {
    console.log("✅ Categoría 'Tecnología' encontrada.");
    categoryLink.click();
    console.log("🖱️ Clic en la categoría 'Tecnología' realizado.");
  } else {
    console.log("❌ No se pudo encontrar la categoría 'Tecnología'.");
  }
}

// Función para hacer clic en el botón 'Ver todo'
function clickOnVerTodoButton() {
  const verTodoButton = document.querySelector(
    "span.MainMenu__wrapper__departments__item.link-all a"
  ) as HTMLElement;

  if (verTodoButton) {
    console.log("✅ Botón 'Ver todo' encontrado.");
    verTodoButton.click();
    console.log("🖱️ Clic en el botón 'Ver todo' realizado.");

    // Marcar que ya se ha hecho clic en "Ver todo"
    localStorage.setItem("categoryLoaded", "true");
  } else {
    console.log("❌ No se pudo encontrar el botón 'Ver todo'.");
  }
}

// Función para esperar a que los productos se carguen
async function waitForProductsToLoad() {
  let retries = 0;
  const maxRetries = 10;

  while (retries < maxRetries) {
    const products = document.querySelectorAll(
      "div.showcase-grid>div> .Showcase__content"
    );
    if (products.length > 0) {
      return true; // Si los productos están cargados, continuamos
    }

    retries++;
    console.log(
      `Esperando a que los productos se carguen... Intento ${retries}`
    );
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Esperamos 2 segundos antes de intentar de nuevo
  }

  console.log("❌ Los productos no se cargaron después de varios intentos.");
  return false;
}

// Función para iniciar el scraping
function startScraping() {
  async function scrappingProducts() {
    await delay(2000); // Pequeña espera para asegurar que los elementos estén cargados

    let cards = [
      ...document.querySelectorAll("div.showcase-grid>div> .Showcase__content"),
    ];

    const products = cards.map((el) => {
      const name = el.querySelector(".Showcase__name")?.textContent;
      const sellerName = el.querySelector(".Showcase__SellerName")?.textContent;
      const salePrice = el.querySelector(".Showcase__salePrice")?.textContent;
      return {
        name,
        sellerName,
        salePrice,
        page: currentPage,
      };
    });

    console.log(`Productos extraídos de la página ${currentPage}:`, products);
    return products;
  }

  // Enviar mensaje para hacer scraping
  chrome.runtime.onMessage.addListener(
    async (request, sender, sendResponse) => {
      if (request.cmd === "scrap") {
        const products = await scrappingProducts();
        port_background.postMessage({
          cmd: "scraped",
          products,
          currentPage,
        });
        sendResponse("ok");
      }
    }
  );

  port_background.onMessage.addListener(async (message) => {
    console.log("Message received:", message);

    if (message.cmd === "scrap-next-page") {
      await delay(3000); // Esperamos para que la página cargue completamente

      currentPage++;

      // Verificamos si hay más páginas
      const paginationButtons = document.querySelectorAll(
        ".pagination__item.page-number"
      );

      if (currentPage < paginationButtons.length) {
        const button = paginationButtons[currentPage] as HTMLElement;
        console.log(`Navegando a la página ${currentPage + 1}`);
        button.click(); // Hacemos clic en el siguiente botón de página
        port_background.postMessage({
          cmd: "next-page",
          currentPage,
        });

        // Esperamos a que la nueva página cargue antes de hacer el scraping
        await waitForProductsToLoad();

        // Realizamos el scraping en la nueva página
        const products = await scrappingProducts();
        port_background.postMessage({
          cmd: "scraped",
          products,
          currentPage,
        });
      } else {
        port_background.postMessage({
          cmd: "finish-scrap",
          message: "END",
        });
      }
    }
  });

  // Iniciar el ciclo de scraping para la primera página
  scrappingProducts();
}

// Ejecutar siempre que se recarga la página, pero solo si no se ha hecho clic en 'Ver todo' previamente
if (!localStorage.getItem("categoryLoaded")) {
  setTimeout(() => {
    toggleDropdownMenu(); // Desplegamos el menú principal

    // Esperamos medio segundo para asegurarnos de que el menú esté desplegado
    setTimeout(() => {
      clickOnCategoryLink(); // Hacemos clic en la categoría 'Tecnología'

      // Esperamos un segundo para asegurarnos de que el submenú esté abierto
      setTimeout(() => {
        clickOnVerTodoButton(); // Hacemos clic en el botón 'Ver todo'
      }, 2000);
    }, 2000);
  }, 2000);
} else {
  // Si ya se ha cargado la categoría, iniciamos directamente el scraping
  console.log(
    "✅ La categoría ya fue cargada previamente. Iniciando el scraping directamente."
  );
  setTimeout(() => {
    startScraping(); // Iniciar el scraping automáticamente después de 5 segundos
  }, 5000);
}
