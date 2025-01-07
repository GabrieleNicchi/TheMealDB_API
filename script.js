
// Funzione per ottenere i parametri dalla URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    //console.log(String(urlParams));
    return urlParams.get(param);
}

function getQueryParamNames() {
    const params = new URLSearchParams(window.location.search);
    let queryParams = [];
    for (let param of params.keys()) {
        queryParams.push(param);
    }
    return String(queryParams);
}

// Funzione di stampa dei pasti
function printMeal(data_meal , mealContainer){
   
    for (var i = 0; i < data_meal.length; i++) {
        const meal = data_meal[i];
        
        // Crea l'elemento per ogni pasto
        const mealElement = document.createElement('div');
        mealElement.classList.add('meal');
        
        // Inserisci il div nella pagina
        mealElement.innerHTML = `
            <h2>${meal.strMeal}</h2>
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <p><a href="dettagli_meal.html">Dettagli</a></p>
        `;
        
        // Aggiungi ogni pasto al contenitore
        mealContainer.appendChild(mealElement);
    }
}

//funzione per stampare tutti gli ingredienti data una ricetta
function append_ingredients(meal) {
    var div_ingredients = document.getElementById('ingredients');
    div_ingredients.innerHTML = "<p><strong>Ingredients:</strong></p><ul>";
    for (i = 1; i <= 20; i++) {
        var ingredient = meal["strIngredient" + i];
        var measure = meal["strMeasure" + i];
        if (ingredient && ingredient.trim() !== "") {
            // Creo un link che mi porta alla pagina ingredients2.html che si occupa di mostrare i piatti in base a un ingrediente principale
            div_ingredients.innerHTML += "<li><a href='Ingredients2.html?ingredient=" + encodeURIComponent(ingredient) + "'>" + ingredient + "</a>" + (measure ? " - " + measure : "") + "</li>";
        }
    }
    div_ingredients.innerHTML += "</ul>";
}

