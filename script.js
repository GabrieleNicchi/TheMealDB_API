

/* ------------------------------ URL ------------------------------ */

// Funzione per ottenere i parametri dalla URL
const getQueryParam = (param) => {
    const urlParams = new URLSearchParams(window.location.search)
    //console.log(String(urlParams))
    return urlParams.get(param)
}

// Funzione per ottenere i nomi dei parametri dalla URL
const getQueryParamNames = () => {
    const params = new URLSearchParams(window.location.search)
    let queryParams = []
    for (let param of params.keys()) {
        queryParams.push(param)
    }
    return String(queryParams)
}

/* ------------------------------ WEB STORAGE ------------------------------ */

const fetchAndStoreMealsByIdRange = async (startId, endId) => {
    let allMeals = [];

    for (let id = startId; id <= endId; id++) {

        // Controlla se i dati sono già presenti nel LocalStorage
        if (localStorage.getItem('meals')) {
            console.log('I dati sono già presenti nel LocalStorage.');
            return;
        }

        try {
            const response = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id);
            const data = await response.json()
            if (data.meals) {
                console.log("data meal: ", data.meals)
                allMeals = allMeals.concat(data.meals)
                console.log("AllMeals: ", allMeals)
            }
        } catch (error) {
            console.error('Error fetching meal data:', error)
        }

        // Ritardo nella richiesta altrimenti CORS blocca
        await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Memorizza tutti i pasti nel localStorage
    localStorage.setItem('meals', JSON.stringify(allMeals))
}

const getMealListStore = (ricerca, name_param) => {

    console.log("script.js: getMealListStore called")
    const meals = JSON.parse(localStorage.getItem('meals'))
    let dataMeals = []

    if (name_param === "meal") {
        // Cerca per nome del pasto
        dataMeals = meals.filter(meal => 
            meal.strMeal.toLowerCase() === ricerca.toLowerCase() || 
            meal.strMeal.toLowerCase().includes(ricerca.toLowerCase())
        )

    } else if (name_param === "ingredient") {
        // Cerca per ingrediente
        dataMeals = meals.filter(meal => {
            for (let i = 1; i <= 20; i++) {
                if (meal[`strIngredient${i}`] && meal[`strIngredient${i}`].toLowerCase() === ricerca.toLowerCase()) {
                    return true
                }
            }
            return false
        })

    } else if (name_param === "letter") {
        // Cerca per prima lettera del nome del pasto
        dataMeals = meals.filter(meal => 
            meal.strMeal[0].toLowerCase() === ricerca.toLowerCase()
        )
    }

    const mealContainer = document.getElementById('meal-container')

    // Se ci sono pasti trovati
    if (dataMeals.length > 0) {
        printMeal(dataMeals, mealContainer)
    } else {
        // Se nessun pasto viene trovato
        mealContainer.innerHTML = '<p>No meal found.</p>'
    }
}

const getMealDetailStore = (id) => {

    console.log("script.js: getMealDetailStore called")
    const meals = JSON.parse(localStorage.getItem('meals'))
    let dataMeal

    // Cerca per ID del pasto
    dataMeal = meals.filter(meal => meal.idMeal === id)

    const mealContainer = document.getElementById('meal-container')
    
    
    //mealContainer.innerHTML = ''

    if (dataMeal.length > 0) {
        printDetailMeal(dataMeal[0], mealContainer)
    } else {
        console.log("getMealDetailStore -> no data")
    }
}

/* ------------------------------ ELENCO MEAL ------------------------------ */

/*
// Funzione generale per ottenere l'elenco dei pasti
const getMealList = ( ricerca , mealContainer , type, ref) => {

    fetch('https://www.themealdb.com/api/json/v1/1/' + type + '.php?' + ref + '=' + ricerca)
    .then(response => response.json())
    .then(data => {
    
    
    // Cancella il contenuto precedente una sola volta, prima del ciclo
    mealContainer.innerHTML = ''

    // Se ci sono pasti trovati
    if (data.meals) {
        
        printMeal(data.meals , mealContainer)
        
    } else {
        // Se nessun pasto viene trovato
        mealContainer.innerHTML = '<p>No meal found.</p>'
    }
    }).catch(error => console.error('Error fetching meal data:', error))

}
*/
// Funzione di stampa dei pasti
const printMeal = (data_meal , mealContainer) => {
   
    for (var i = 0; i < data_meal.length; i++) {
        const meal = data_meal[i]
        
        // Crea l'elemento per ogni pasto
        const mealElement = document.createElement('div');
        mealElement.classList.add('meal')
        
        // Inserisci il div nella pagina
        // Quando l'utente clicca su 'Dettagli' passa l'id del piatto selezionato
        mealElement.innerHTML = `
            <h2>${meal.strMeal}</h2>
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <p><a href="dettagli_meal.html?idMeal=${meal.idMeal}">Dettagli</a></p>
        `;
        
        // Aggiungi ogni pasto al contenitore
        mealContainer.appendChild(mealElement)
    }
}

/* ------------------------------ MEAL DETTAGLI ------------------------------ */

/*
// Funzione generale per ottenere i dettagli di un pasto
const getDetailMealList = ( id ) => {

    fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id)
    .then(response => response.json())
    .then(data => {
    
    const mealContainer = document.getElementById('meal-container')
    
    // Cancella il contenuto precedente una sola volta, prima del ciclo
    mealContainer.innerHTML = ''

    // Se c'è un pasto trovato
    if (data.meals) {
        
        printDetailMeal(data.meals[0] , mealContainer)
        
    } else {
        // Errore nella richiesta
    }
    }).catch(error => console.error('Error fetching meal data:', error))
}
*/

// Funzione di stampa di un pasto
const printDetailMeal = (meal, mealContainer) => {
    // Crea l'elemento per ogni pasto
    const mealElement = document.createElement('div')
    mealElement.classList.add('meal')

    // Inserisci il div nella pagina
    mealElement.innerHTML = `
        <h1>${meal.strMeal}</h1>
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <p><h3>Categoria:</h3> ${meal.strCategory}</p>
        <p><h3>Area:</h3> ${meal.strArea}</p>
        <p><h3>Istruzioni:</h3> ${meal.strInstructions}</p>
        <div id="ingredients">${append_ingredients(meal)}</div>
    `

    // Aggiungi ogni pasto al contenitore
    mealContainer.appendChild(mealElement)
}

// Funzione per stampare tutti gli ingredienti dato un pasto
const append_ingredients = (meal) => {
    let ingredientsHTML = "<p><strong>Ingredients:</strong></p><ul>"
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal["strIngredient" + i];
        const measure = meal["strMeasure" + i];
        if (ingredient && ingredient.trim() !== "") {
             // Creo un link che mi riporta alla pagina 'dettagli_meal.html' che si occupa di mostrare i pasti in base a un ingrediente principale
            ingredientsHTML += `<li><a href='elenco_meal.html?ingredient=${encodeURIComponent(ingredient)}'>${ingredient}</a>${measure ? " - " + measure : ""}</li>`
        }
    }
    ingredientsHTML += "</ul>"
    return ingredientsHTML
}

/* ------------------------------ PROFILO UTENTE ------------------------------ */

class Utente {

    constructor(username, email, password , paese , categoria) {
        this.username = username
        this.email = email
        this.password = password
        this.paese = paese
        this.categoria = categoria
        this.pastiPreferiti = [] // Array di oggetti PastiPreferiti
    }

    // Metodo per aggiungere un pasto preferito con commento
    aggiungiPastoPreferito(idPasto, commento = '') {
        const pastoPreferito = new PastiPreferiti(idPasto, commento)
        this.pastiPreferiti.push(pastoPreferito)
    }

    // Metodo per aggiungere o aggiornare un commento a un pasto preferito dato l'ID
    aggiungiCommento(idPasto, commento) {
        const pasto = this.pastiPreferiti.find(p => p.id === idPasto)
        if (pasto) {
            pasto.commento = commento
        } else {
            console.log(`Pasto con ID ${idPasto} non trovato nei pasti preferiti.`)
        }
    }
}

class PastiPreferiti {
    constructor(id, commento) {
        this.id = id; // ID del pasto
        this.commento = commento; // Possibile commento al pasto
    }
}

const register = () => {

    const username = document.getElementById('nome_utente').value
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const paese = document.getElementById('paese').value
    const categoria = document.getElementById('categoria').value

    const nuovoUtente = new Utente(username, email, password, paese, categoria)

    let utenti = JSON.parse(localStorage.getItem('utenti')) || []
    utenti.push(nuovoUtente);
    localStorage.setItem('utenti', JSON.stringify(utenti))

    console.log('Utente registrato:', nuovoUtente)
    window.location.href = 'login.html'

    return false

}

const login = () => {
    const utenza = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Recupera l'array di utenti dal LocalStorage
    const utenti = JSON.parse(localStorage.getItem('utenti')) || [];

    // Cerca l'utente che corrisponde all'email o al nome utente e alla password
    const utente = utenti.find(user => 
        (user.email === utenza || user.username === utenza) && user.password === password
    )

    if (utente) {
        // Salva l'utente nel SessionStorage
        sessionStorage.setItem('utenteLoggato', JSON.stringify(utente))
        console.log('Login effettuato con successo:', utente)

        // Reindirizza alla pagina principale o alla dashboard
        window.location.href = 'index.html'
    } else {
        // Gestisci il caso in cui l'utente non venga trovato
        console.log('Email o password non corretti.')
    }
    return false
}

const checkUserLogged = () => {
     // Controlla se c'è un utente salvato nel session storage
     const utenteLoggato = JSON.parse(sessionStorage.getItem('utenteLoggato'))
     const userInfoElement = document.getElementById('user-info')

     if (utenteLoggato) {
         // Mostra il nome utente e l'immagine
         userInfoElement.innerHTML = `
             <a href=""><button type="button" class="btn btn-light">
                ${utenteLoggato.username}<img src="img/person-workspace.svg" alt="Icona utente" width="24" height="24">
             </button></a>
         `
     } else {
         // Mostra la scritta "Accedi" e l'immagine
         userInfoElement.innerHTML = `
             <a href="login.html"><button type="button" class="btn btn-light">
                 Accedi <img src="img/door-open-fill.svg" alt="Icona lista" width="24" height="24">
             </button></a>
         `
     }
}
