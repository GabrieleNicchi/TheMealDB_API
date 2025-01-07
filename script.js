

/* ------------------------------ URL ------------------------------ */

// Funzione per ottenere i parametri dalla URL
const getQueryParam = (param) => {
    const urlParams = new URLSearchParams(window.location.search);
    //console.log(String(urlParams));
    return urlParams.get(param);
}

// Funzione per ottenere i nomi dei parametri dalla URL
const getQueryParamNames = () => {
    const params = new URLSearchParams(window.location.search);
    let queryParams = [];
    for (let param of params.keys()) {
        queryParams.push(param);
    }
    return String(queryParams);
}

/* ------------------------------ ELENCO MEAL ------------------------------ */

// Funzione generale per ottenere l'elenco dei pasti
const getMealList = ( ricerca , mealContainer , type, ref) => {

    fetch('https://www.themealdb.com/api/json/v1/1/' + type + '.php?' + ref + '=' + ricerca)
    .then(response => response.json())
    .then(data => {
    
    
    // Cancella il contenuto precedente una sola volta, prima del ciclo
    mealContainer.innerHTML = '';

    // Se ci sono pasti trovati
    if (data.meals) {
        
        printMeal(data.meals , mealContainer);
        
    } else {
        // Se nessun pasto viene trovato
        mealContainer.innerHTML = '<p>No meal found.</p>';
    }
    }).catch(error => console.error('Error fetching meal data:', error));

}

// Funzione di stampa dei pasti
const printMeal = (data_meal , mealContainer) => {
   
    for (var i = 0; i < data_meal.length; i++) {
        const meal = data_meal[i];
        
        // Crea l'elemento per ogni pasto
        const mealElement = document.createElement('div');
        mealElement.classList.add('meal');
        
        // Inserisci il div nella pagina
        // Quando l'utente clicca su 'Dettagli' passa l'id del piatto selezionato
        mealElement.innerHTML = `
            <h2>${meal.strMeal}</h2>
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <p><a href="dettagli_meal.html?idMeal=${meal.idMeal}">Dettagli</a></p>
        `;
        
        // Aggiungi ogni pasto al contenitore
        mealContainer.appendChild(mealElement);
    }
}

/* ------------------------------ MEAL DETTAGLI ------------------------------ */

// Funzione generale per ottenere i dettagli di un pasto
const getDetailMealList = ( id ) => {

    fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id)
    .then(response => response.json())
    .then(data => {
    
    const mealContainer = document.getElementById('meal-container')
    
    // Cancella il contenuto precedente una sola volta, prima del ciclo
    mealContainer.innerHTML = '';

    // Se c'è un pasto trovato
    if (data.meals) {
        
        printDetailMeal(data.meals[0] , mealContainer);
        
    } else {
        // Errore nella richiesta
    }
    }).catch(error => console.error('Error fetching meal data:', error));
}

// Funzione di stampa di un pasto
const printDetailMeal = (meal, mealContainer) => {
    // Crea l'elemento per ogni pasto
    const mealElement = document.createElement('div');
    mealElement.classList.add('meal');

    // Inserisci il div nella pagina
    mealElement.innerHTML = `
        <h1>${meal.strMeal}</h1>
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <p><h3>Categoria:</h3> ${meal.strCategory}</p>
        <p><h3>Area:</h3> ${meal.strArea}</p>
        <p><h3>Istruzioni:</h3> ${meal.strInstructions}</p>
        <div id="ingredients">${append_ingredients(meal)}</div>
    `;

    // Aggiungi ogni pasto al contenitore
    mealContainer.appendChild(mealElement);
}

// Funzione per stampare tutti gli ingredienti dato un pasto
const append_ingredients = (meal) => {
    let ingredientsHTML = "<p><strong>Ingredients:</strong></p><ul>";
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal["strIngredient" + i];
        const measure = meal["strMeasure" + i];
        if (ingredient && ingredient.trim() !== "") {
             // Creo un link che mi riporta alla pagina 'dettagli_meal.html' che si occupa di mostrare i pasti in base a un ingrediente principale
            ingredientsHTML += `<li><a href='elenco_meal.html?ingredient=${encodeURIComponent(ingredient)}'>${ingredient}</a>${measure ? " - " + measure : ""}</li>`;
        }
    }
    ingredientsHTML += "</ul>";
    return ingredientsHTML;
}

//GIT

