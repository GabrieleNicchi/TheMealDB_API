

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
    let allMeals = []

    for (let id = startId; id <= endId; id++) {

        // Controlla se i dati sono già presenti nel LocalStorage
        if (localStorage.getItem('meals')) {
            //console.log('I dati sono già presenti nel LocalStorage.')
            return
        }

        try {
            const response = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id)
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

    //console.log("script.js: getMealListStore called")

    try{
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
    } catch (error) {
        window.location.href = 'error.html'
        console.log("Error in getMealListStore")
    }
    
}

const getMealDetailStore = (id) => {

    //console.log("script.js: getMealDetailStore called")

    try{
        const meals = JSON.parse(localStorage.getItem('meals'))
        let dataMeal
    
        // Cerca per ID del pasto
        dataMeal = meals.filter(meal => meal.idMeal === id)
    
        const mealContainer = document.getElementById('meal-detail')
        
        
        //mealContainer.innerHTML = ''
    
        if (dataMeal.length > 0) {
            printDetailMeal(dataMeal[0], mealContainer)
        } else {
            console.log("getMealDetailStore -> no data")
        }
    } catch (error) {
        window.location.href = 'error.html'
        console.log("Error in getMealDetailStore")
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
const printMeal = (data_meal, mealContainer) => {

    for (var i = 0; i < data_meal.length; i++) {
        const meal = data_meal[i]
        const prefs = checkFavoriteMeal(meal)

        // Crea l'elemento per ogni pasto
        const mealElement = document.createElement('div')
        mealElement.classList.add('meal')

        // Inserisci il div nella pagina
        mealElement.innerHTML = `
            <a href="dettagli_meal.html?idMeal=${meal.idMeal}" class="card-link">
                <h2>${meal.strMeal}</h2>
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            </a>
            <p>
                <button class="btn btn-light fav-button">
                    <img src="img/${prefs ? 'heart-fill' : 'heart'}.svg" alt="Icona preferiti" width="200" height="200">
                </button>
            </p>
        `

        // Aggiungi l'event listener al bottone dei preferiti
        mealElement.querySelector('.fav-button').addEventListener('click', (event) => {
            event.stopPropagation() 
            updateFavMeal(meal, mealElement.querySelector('.fav-button'))
        })

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
    mealElement.classList.add('meal-detail')

    const prefs = checkFavoriteMeal(meal)

    // Inserisci il div nella pagina
    mealElement.innerHTML = `
        <div class='container'>
            <div class='meal-detail-pointer d-flex flex-column align-items-center'>
                <!-- Nome, immagine e bottone centrati sopra -->
                <h1 class="text-center">${meal.strMeal}</h1>
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class='img-detail my-3'>
                <button class="btn btn-light fav-button">
                    <img src="img/${prefs ? 'heart-fill' : 'heart'}.svg" alt="Icona preferiti" width="30" height="30">
                </button>

                <div class='row w-100 mt-4'>
                    <!-- Colonna Istruzioni -->
                    <div class='col-lg-6 col-md-12 d-flex flex-column align-items-center text-center'>
                        <p><h3><img src="img/book-half.svg" alt="Istruzioni Icon" width="24" height="24"> Istruzioni:</h3> ${meal.strInstructions}</p>
                    </div>

                    <!-- Colonna Categoria e Area -->
                    <div class='col-lg-3 col-md-6 d-flex flex-column align-items-center text-center'>
                        <p><h3> Categoria:</h3> ${meal.strCategory}</p>
                        <p><h3> Area:</h3> ${meal.strArea}</p>
                    </div>

                    <!-- Colonna Ingredienti -->
                    <div class='col-lg-3 col-md-6 d-flex flex-column align-items-center text-center'>
                        <p><h3><img src="img/inboxes-fill.svg" alt="Ingredienti Icon" width="24" height="24"> Ingredienti:</h3></p>
                        <div id="ingredients">${append_ingredients(meal)}</div>
                    </div>
                </div>
            </div>
        </div>
        <div id="review" class="review-detail">${printReview(meal.idMeal)}</div>
    `





    // Aggiungi l'event listener al bottone dei preferiti
    mealElement.querySelector('.fav-button').addEventListener('click', () => updateFavMeal(meal, mealElement.querySelector('.fav-button')))

    // Controllo se l'utente ha già effettuato una recensione
    // 'false' ->  placeReview()
    const hasReviewed = hasUserLeftReview(meal.idMeal)

    if(hasReviewed){

        // Aggiungi l'event listener al bottone delle recensioni
        mealElement.querySelector('.review-button').addEventListener('click', () => {
            document.getElementById('review-overlay').style.display = 'flex'
            document.getElementById('submit-review').onclick = () => editReview(meal.idMeal)
        })

    } else {

        // Aggiungi l'event listener al bottone delle recensioni
        mealElement.querySelector('.review-button').addEventListener('click', () => {
            document.getElementById('review-overlay').style.display = 'flex'
            document.getElementById('submit-review').onclick = () => placeReview(meal.idMeal)
        })

    }
    

    // Chiudi l'overlay
    document.getElementById('close-overlay').addEventListener('click', () => {
        document.getElementById('review-overlay').style.display = 'none'
    })

    // Aggiungi ogni pasto al contenitore
    mealContainer.appendChild(mealElement)
}

// Funzione per stampare tutti gli ingredienti dato un pasto
const append_ingredients = (meal) => {
    let ingredientsHTML = "<ul>"
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal["strIngredient" + i]
        const measure = meal["strMeasure" + i]
        if (ingredient && ingredient.trim() !== "") {
            // Creo un link che mi riporta alla pagina 'dettagli_meal.html' che si occupa di mostrare i pasti in base a un ingrediente principale
            ingredientsHTML += `<li class='ingredient-item'><a href='elenco_meal.html?ingredient=${encodeURIComponent(ingredient)}'>${ingredient}</a>${measure ? " - " + measure : ""}</li>`
        }
    }
    ingredientsHTML += "</ul>"
    return ingredientsHTML
}

/* ------------------------------ RICETTARIO ------------------------------ */

const checkFavoriteMeal = (meal) => {

    // Recupera l'utente loggato dal session storage
    const utenteLoggato = JSON.parse(sessionStorage.getItem('utenteLoggato'))

    if(!utenteLoggato){
        return
    }

    // Verifica se il pasto è tra i preferiti
    return utenteLoggato.pastiPreferiti.some(p => p.id === meal.idMeal)

}

const updateFavMeal = (meal, button) => {

    try{
        // Recupera l'utente loggato dal session storage
        const utenteLoggato = JSON.parse(sessionStorage.getItem('utenteLoggato'))

        if (!utenteLoggato) {
            alert("Perfavore, effettua il login per vedere i tuoi pasti preferiti")
            window.location.href = 'login.html'
            return
        }

        // Controlla se il piatto era tra i preferiti
        const isFavorite = checkFavoriteMeal(meal)

        if (isFavorite) {
            // Rimuovi il pasto dai preferiti
            utenteLoggato.pastiPreferiti = utenteLoggato.pastiPreferiti.filter(p => p.id !== meal.idMeal)
            button.querySelector('img').src = 'img/heart.svg'; // Cambia l'icona
        } else {
            // Aggiungi il pasto ai preferiti
            utenteLoggato.pastiPreferiti.push({ id: meal.idMeal, commento: '' })
            button.querySelector('img').src = 'img/heart-fill.svg' // Cambia l'icona
        }

        // Aggiorna il session storage
        sessionStorage.setItem('utenteLoggato', JSON.stringify(utenteLoggato))

        // Aggiorna il local storage
        const utenti = JSON.parse(localStorage.getItem('utenti')) || []
        const utenteIndex = utenti.findIndex(u => u.email === utenteLoggato.email)

        if (utenteIndex !== -1) {
            utenti[utenteIndex].pastiPreferiti = utenteLoggato.pastiPreferiti
            localStorage.setItem('utenti', JSON.stringify(utenti))
        }
    } catch (error) {
        window.location.href = 'error.html'
        console.log("Error in updateFavMeal")
    }
    
}

const saveNote = (idMeal, commento) => {

    try{
        const utenteLoggatoData = JSON.parse(sessionStorage.getItem('utenteLoggato'))

        // Crea un'istanza della classe Utente
        const utenteLoggato = new Utente(
            utenteLoggatoData.username,
            utenteLoggatoData.email,
            utenteLoggatoData.password,
            utenteLoggatoData.paese,
            utenteLoggatoData.categoria
        )

        // Aggiungi i pasti preferiti esistenti all'istanza dell'utente
        utenteLoggatoData.pastiPreferiti.forEach(pasto => {
            utenteLoggato.aggiungiPastoPreferito(pasto.id, pasto.commento)
        })

        
        //console.log('Pasti preferiti:', utenteLoggato.pastiPreferiti)
        const pasto = utenteLoggato.pastiPreferiti.find(p => p.id === idMeal.toString())
        if (!pasto) {
            console.error(`Pasto con ID ${idMeal} non trovato nei pasti preferiti.`)
            return
        }

        // Aggiungi o aggiorna il commento
        utenteLoggato.aggiungiCommento(idMeal.toString(), commento)

        // Aggiorna il session storage
        sessionStorage.setItem('utenteLoggato', JSON.stringify(utenteLoggato))

        // Aggiorna il local storage
        const utenti = JSON.parse(localStorage.getItem('utenti')) || []
        const utenteIndex = utenti.findIndex(u => u.email === utenteLoggato.email)

        if (utenteIndex !== -1) {
            utenti[utenteIndex].pastiPreferiti = utenteLoggato.pastiPreferiti
            localStorage.setItem('utenti', JSON.stringify(utenti))
        }

        // Aggiorna la visualizzazione della nota
        const noteContainer = document.querySelector(`#noteContainer-${idMeal}`)
        noteContainer.innerHTML = `
            <p>${commento}</p>
            <button class="btn btn-light edit-note-button" onclick="editNote(${idMeal}, '${commento}')">Modifica Nota</button>
        `
    } catch(error){
        window.location.href = 'error.html'
        console.log("Error in saveNote: " , error)
    }
    
}

const editNote = (idMeal, commento) => {
    const noteContainer = document.querySelector(`#noteContainer-${idMeal}`)
    noteContainer.innerHTML = `
        <div class="noteArea">
        <textarea id='noteText-${idMeal}' rows='4' cols='50' placeholder='Scrivi la tua nota qui...'>${commento}</textarea><br>
        <button class="btn btn-light" onclick="saveNote(${idMeal}, document.getElementById('noteText-${idMeal}').value)">Salva Nota</button>
        </div>
    `
}

const getFavMeal = () => {

    try{
        // Recupera l'utente loggato dal session storage
        const utenteLoggato = JSON.parse(sessionStorage.getItem('utenteLoggato'))
        const mealContainer = document.getElementById('meal-container')

        // Se l'utente non ha salvato alcun piatto
        if(utenteLoggato.pastiPreferiti.length == 0){
            // Crea l'elemento per ogni pasto
            const mealElement = document.createElement('div')
            mealElement.classList.add('meal')
            
            // Inserisci il div nella pagina
            mealElement.innerHTML = `
                <h2> Nessun piatto tra i preferiti :( </h2>
            `
            // Aggiungi ogni pasto al contenitore
            mealContainer.appendChild(mealElement)
        }

        // Recupera tutti i pasti dal local storage
        const meals = JSON.parse(localStorage.getItem('meals'))
        let dataMeals = []

        // Itera sui pasti preferiti dell'utente
        for (let i = 0; i < utenteLoggato.pastiPreferiti.length; i++) {
            const id = utenteLoggato.pastiPreferiti[i].id
            // Cerca per ID del pasto
            const meal = meals.find(meal => meal.idMeal === id)
            if (meal) {
                dataMeals.push(meal)
            }
        }

        // Stampa i pasti preferiti
        printMealPrefs(dataMeals, mealContainer )
    } catch (error) {
        window.location.href = 'error.html'
        console.log("Error in getFavMeal: " , error)
    }
    
}

// Funzione dei pasti preferiti del ricettario
const printMealPrefs = (data_meal, mealContainer) => {
    
    for (let i = 0; i < data_meal.length; i++) {
        const meal = data_meal[i]
        const prefs = checkFavoriteMeal(meal)
        const utenteLoggato = JSON.parse(sessionStorage.getItem('utenteLoggato'))
        const pastoPreferito = utenteLoggato.pastiPreferiti.find(p => p.id === meal.idMeal)
        const commento = pastoPreferito ? pastoPreferito.commento : ''

        // Crea l'elemento per ogni pasto
        const mealElement = document.createElement('div')
        mealElement.classList.add('meal', 'card')
        mealElement.style.cursor = 'pointer'

        // Aggiungi l'evento click alla card (controllando il target)
        mealElement.addEventListener('click', (event) => {
            // Verifica se il target è interattivo (textarea o pulsante)
            if (event.target.tagName === 'TEXTAREA' || event.target.tagName === 'BUTTON') {
                return
            }
            // Naviga ai dettagli del meal
            window.location.href = `dettagli_meal.html?idMeal=${meal.idMeal}`
        })

        // Inserisci il contenuto della card
        mealElement.innerHTML = `
            <h2>${meal.strMeal}</h2>
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <p>
                <button class="btn btn-light note-button">Mostra/Nascondi Nota</button>
                <div id='noteContainer-${meal.idMeal}' style='display:none;'>
                    ${commento ? 
                        `<p>${commento}</p><button class="btn btn-light edit-note-button">Modifica Nota</button>` 
                        : 
                        `
                        <div class="noteArea">
                        <textarea id='noteText-${meal.idMeal}' rows='4' cols='50' placeholder='Scrivi la tua nota qui...'></textarea><br><button class="btn btn-light save-note-button">Salva Nota</button>
                        </div>
                        `
                    }
                </div>
                <button class="btn btn-light fav-button">
                    <img src="img/${prefs ? 'heart-fill' : 'heart'}.svg" alt="Icona preferiti" width="30" height="30">
                </button>
            </p>
        `

        // Event listener per il pulsante "Mostra/Nascondi Nota"
        mealElement.querySelector('.note-button').addEventListener('click', (event) => {
            event.stopPropagation()
            const noteContainer = mealElement.querySelector(`#noteContainer-${meal.idMeal}`)
            noteContainer.style.display = noteContainer.style.display === 'none' ? 'block' : 'none'
        })

        // Gestione della textarea
        const textArea = mealElement.querySelector(`#noteText-${meal.idMeal}`)
        if (textArea) {
            textArea.addEventListener('click', (event) => {
                event.stopPropagation()
            })
        }

        // Event listener per il pulsante "Salva Nota"
        const saveButton = mealElement.querySelector('.save-note-button')
        if (saveButton) {
            saveButton.addEventListener('click', (event) => {
                event.stopPropagation()
                const noteText = mealElement.querySelector(`#noteText-${meal.idMeal}`).value
                saveNote(meal.idMeal, noteText)
            })
        }

        // Event listener per il pulsante "Modifica Nota"
        const editButton = mealElement.querySelector('.edit-note-button');
        if (editButton) {
            editButton.addEventListener('click', (event) => {
                event.stopPropagation() 
                editNote(meal.idMeal, commento)
            })
        }

        // Event listener per il pulsante "Preferiti"
        mealElement.querySelector('.fav-button').addEventListener('click', (event) => {
            event.stopPropagation()
            updateFavMeal(meal, mealElement.querySelector('.fav-button'))
        })

        // Aggiungi ogni pasto al contenitore
        mealContainer.appendChild(mealElement)
    }
}


/* ------------------------------ CONTROLLO INPUT ------------------------------ */

//funzione generale validità input con regex
const CheckForm = (value) => {

    var regex = /^[a-z\s]+$/i
    if(value.match(regex)){
        return true
    } else {
        return false
    }
}

//funzione generale che l'utente abbia inserito qualcosa nel campo
const CheckInsert = (value) => value.trim().length > 0

const checkFormMeal = (value) => {

    let searchinput, inputValue, errorMessage

    if (value === "meal") {
        searchinput = document.getElementById("searchInputMeal")
        inputValue = searchinput.value
        errorMessage = document.getElementById("errorMessagemeal")

    } else if (value === "ingredient") {
        searchinput = document.getElementById("searchInputMealIngredient")
        inputValue = searchinput.value
        errorMessage = document.getElementById("errorMessageingredient")

    } else if (value === "letter") {
        searchinput = document.getElementById("searchInputMealLetter")
        inputValue = searchinput.value
        errorMessage = document.getElementById("errorMessageletter")

        if (!CheckInsert(inputValue)) {
            errorMessage.innerHTML = "Per favore, seleziona una lettera."
            searchinput.style.border = "1px solid red"
            return false
        }
        return true
    } else {
        //console.log("Qualcosa è andato storto")
        return false
    }

    if (CheckInsert(inputValue)) {
        if (CheckForm(inputValue)) {
            return true
        } else {
            errorMessage.innerHTML = "Il campo contiene caratteri non validi."
            searchinput.style.border = "1px solid red"
            return false
        }
    } else {
        errorMessage.innerHTML = "Per favore, inserisci qualcosa."
        searchinput.style.border = "1px solid red"
        return false
    }
}

const checkUserExist = (username, email) => {

    const utenti = JSON.parse(localStorage.getItem('utenti')) || []

    // Trova un utente con lo stesso username o email
    const userExists = utenti.find(user => user.username === username || user.email === email)

    if (!userExists) return null
    return userExists.username === username ? "username" : "email"
}

const checkRegister = (username, email, password, paese) => {

    const fields = [
        { value: username, errorMessageId: "errorMessagenome_utente" },
        { value: email, errorMessageId: "errorMessageemail" },
        { value: password, errorMessageId: "errorMessagepassword" },
        { value: paese, errorMessageId: "errorMessagepaese" }
    ]

    let isValid = true

     // Ripulisci tutti i messaggi di errore all'inizio
     fields.forEach(field => {
        document.getElementById(field.errorMessageId).innerHTML = ""
    })

    const existUser = checkUserExist(username, email)

    if (existUser === "username") {
        document.getElementById("errorMessagenome_utente").innerHTML = "Nome utente già esistente"
        isValid = false
        return isValid
    } 

    if (existUser === "email") {
        document.getElementById("errorMessageemail").innerHTML = "Utente già registrato con questa mail"
        isValid = false
        return isValid
    }

    //console.log("Username:", username, "Email:", email)
    //console.log("Risultato checkUserExist:", checkUserExist(username, email))
    //console.log("CheckInsert Username:", CheckInsert(username))

    fields.forEach(field => {
        if (CheckInsert(field.value)) {
            document.getElementById(field.errorMessageId).innerHTML = ""
        } else {
            document.getElementById(field.errorMessageId).innerHTML = "Per favore riempi questo campo"
            isValid = false
        }
    })

    return isValid
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

    
    try{
        const username = document.getElementById('nome_utente').value
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        const paese = document.getElementById('paese').value
        const categoria = document.getElementById('categoria').value

        if(checkRegister(username, email, password, paese)) {
            const nuovoUtente = new Utente(username, email, password, paese, categoria)

            let utenti = JSON.parse(localStorage.getItem('utenti')) || []
            utenti.push(nuovoUtente)
            localStorage.setItem('utenti', JSON.stringify(utenti))

            window.location.href = 'login.html'
            alert('Utente registrato!')
        }

        return false
    } catch (error) {
        window.location.href = 'error.html'
        console.log("Error in register: " , error)
    }
    

}

const login = () => {

    try{
        const utenza = document.getElementById('email').value
        const password = document.getElementById('password').value

        // Recupera l'array di utenti dal LocalStorage
        const utenti = JSON.parse(localStorage.getItem('utenti')) || []

        // Cerca l'utente che corrisponde all'email o al nome utente e alla password
        const utente = utenti.find(user => 
            (user.email === utenza || user.username === utenza) && user.password === password
        )

        if (utente) {
            // Salva l'utente nel SessionStorage
            sessionStorage.setItem('utenteLoggato', JSON.stringify(utente))
            alert(`Login effettuato con successo! Ciao ${utente.username}`)

            // Reindirizza alla pagina principale o alla dashboard
            window.location.href = 'index.html'
        } else {
            // Gestisci il caso in cui l'utente non venga trovato
            alert('Email o password non corretti, per favore, riprova')
        }
        return false
    } catch (error) {
        window.location.href = 'error.html'
        console.log("Error in register: " , error)
    }
    
}

const checkUserLogged = () => {
     // Controlla se c'è un utente salvato nel session storage
     const utenteLoggato = JSON.parse(sessionStorage.getItem('utenteLoggato'))
     const userInfoElement = document.getElementById('user-info')

     if (utenteLoggato) {
        // Mostra il nome utente e il menu a tendina
        userInfoElement.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-light dropbtn">
                    <img src="img/person-workspace.svg" alt="Icona utente" width="44" height="24">
                </button>
                <div class="dropdown-content">
                    <span class="dropdown-span normal-text">${utenteLoggato.username}</span>
                    <span class="small-text">
                        <a href="preferiti.html"><img src="img/person-heart.svg" alt="Icona preferiti" width="24" height="24"> Ricettario</a>
                    </span>
                    <span class="small-text">
                        <a href="modifica_profilo.html"><img src="img/person-fill-gear.svg" alt="Icona modifica profilo" width="24" height="24">Modifica profilo</a>
                    </span>
                    <span class="small-text">
                        <a href="#" id="logout-button"><img src="img/door-closed-fill.svg" alt="Icona logout" width="24" height="24">Logout</a>
                    </span>
                </div>
            </div>
        `

        // Aggiungi l'evento di click al pulsante di logout
        document.getElementById('logout-button').addEventListener('click', function() {
            sessionStorage.removeItem('utenteLoggato')
            window.location.href = 'index.html'
        })

     } else {
         // Mostra la scritta "Accedi" e l'immagine
         userInfoElement.innerHTML = `
             <a href="login.html"><button type="button" class="btn btn-light" style="padding-right:50px">
                 Accedi <img src="img/door-open-fill.svg" alt="Icona lista" width="24" height="24">
             </button></a>
         `
     }
}

/* ------------------------------ RECENSIONI ------------------------------ */

class Recensione {
    constructor(idPasto) {
        this.idPasto = idPasto
        this.valutazioni = []
    }

    // Metodo per aggiungere una nuova valutazione ad un piatto
    aggiungiValutazione(utente, rankGusto, rankDifficolta, commento) {
        const valutazione = new Valutazione(utente, rankGusto, rankDifficolta, commento)
        this.valutazioni.push(valutazione)
    }

    // Metodo per modificare una valutazione esistente
    modificaValutazione(utente, rankGusto, rankDifficolta, commento) {
        const valutazione = this.valutazioni.find(v => v.utente === utente)
        if (valutazione) {
            valutazione.rankGusto = rankGusto
            valutazione.rankDifficolta = rankDifficolta
            valutazione.commento = commento
        } else {
            console.log(`Valutazione per l'utente ${utente} non trovata.`)
        }
    }
}

class Valutazione {
    constructor(utente, rankGusto, rankDifficolta, commento) {
        this.utente = utente
        this.rankGusto = rankGusto
        this.rankDifficolta = rankDifficolta
        this.commento = commento
    }
}

// Funzione per stampare tutte le recensioni dato un piatto
const printReview = (id) => {

    const recensioni = JSON.parse(localStorage.getItem('recensioni')) || []
    let recensione = recensioni.find(review => review.idPasto === id)

    let recensioneHtml = ""

    if (recensione && recensione.valutazioni.length > 0) {
        recensioneHtml += `<h5 class='center-text'>Recensioni</h5>`
        recensione.valutazioni.forEach(valutazione => {
            recensioneHtml += `
                <p><h5><img src="img/person-circle.svg" alt="Utente Icon" width="40" height="40" class='my-4'> ${valutazione.utente}</h5></p>
                <p>Gusto: ${generateStars(valutazione.rankGusto)}</p>
                <p>Difficoltà: ${generateStars(valutazione.rankDifficolta)}</p>
                <p>Commento: ${valutazione.commento}</p>
                <hr>
            `
        })
    } else {
        recensioneHtml = `<h5 class='center-text'>Ancora nessuna recensione.</h5>`
    }

    const hasReviewed = hasUserLeftReview(id)

    recensioneHtml += `
        <button class="btn btn-light review-button">${hasReviewed ? 'Modifica recensione' : 'Lascia una recensione'}</button>
        <div id="reviewContainer-${id}" style="display:none;">
            <textarea id="reviewText-${id}" rows="4" cols="50" placeholder="Scrivi la tua recensione qui..."></textarea><br>
            <div id="star-rating-gusto-${id}">
                <img src="img/star.svg" class="star" data-value="1">
                <img src="img/star.svg" class="star" data-value="2">
                <img src="img/star.svg" class="star" data-value="3">
                <img src="img/star.svg" class="star" data-value="4">
                <img src="img/star.svg" class="star" data-value="5">
            </div>
            <span id="rating-value-gusto-${id}">0</span><br>
            <div id="star-rating-difficolta-${id}">
                <img src="img/star.svg" class="star" data-value="1">
                <img src="img/star.svg" class="star" data-value="2">
                <img src="img/star.svg" class="star" data-value="3">
                <img src="img/star.svg" class="star" data-value="4">
                <img src="img/star.svg" class="star" data-value="5">
            </div>
            <span id="rating-value-difficolta-${id}">0</span><br>
            <button class="btn btn-light" onclick="${hasReviewed ? `editReview(${id})` : `placeReview(${id})`}">${hasReviewed ? 'Modifica Recensione' : 'Invia Recensione'}</button>
        </div>
    `

    return recensioneHtml
}

// Funzione per piazzare una nuova recensione dell'utente loggato
const placeReview = (idMeal) => {
    
    //console.log("placeReview called")

    try{
        const utenteLoggato = JSON.parse(sessionStorage.getItem('utenteLoggato'))

        if (!utenteLoggato) {
            alert("Perfavore, effettua il login per lasciare una recensione")
            window.location.href = 'login.html'
            return
        }

        const commento = document.getElementById('overlay-reviewText').value
        const rankGusto = parseFloat(document.getElementById('rating-value-gusto').textContent)
        const rankDifficolta = parseFloat(document.getElementById('rating-value-difficolta').textContent)

        if (!commento || !rankGusto || !rankDifficolta) {
            alert("Perfavore, inserisci sia una valutazione che un commento")
            return
        }

        let recensioni = JSON.parse(localStorage.getItem('recensioni')) || []
        recensioni = recensioni.map(review => Object.assign(new Recensione(), review))

        let recensione = recensioni.find(review => review.idPasto === idMeal)

        if (!recensione) {
            recensione = new Recensione(idMeal)
            recensioni.push(recensione)
        }

        recensione.aggiungiValutazione(utenteLoggato.username, rankGusto, rankDifficolta, commento)
        localStorage.setItem('recensioni', JSON.stringify(recensioni))

        document.getElementById('review-overlay').style.display = 'none'
        document.getElementById('review').innerHTML = printReview(idMeal)
        window.location.reload()
    } catch (error) {
        window.location.href = 'error.html'
        console.log("Error in placeReview: " , error) 
    }
}

// Controlla se: o nessuno è loggato o l'utente loggato non ha effettuato ancora nessuna recensione sul piatto
const hasUserLeftReview = (idMeal) => {

    const utenteLoggato = JSON.parse(sessionStorage.getItem('utenteLoggato'))
    if (!utenteLoggato) {
        return false
    }

    // Prendi le recensioni dal Local Storage
    const recensioni = JSON.parse(localStorage.getItem('recensioni')) || []

    // Trova la recensione per il pasto specifico
    const recensione = recensioni.find(review => review.idPasto === idMeal)

    if (recensione) {
        // Itera tra le valutazioni della recensione
        for (let valutazione of recensione.valutazioni) {
            if (valutazione.utente === utenteLoggato.username) {
                return true
            }
        }
    }

    return false
}

const editReview = (idMeal) => {

    //console.log("editReview called")

    try{
        const utenteLoggato = JSON.parse(sessionStorage.getItem('utenteLoggato'))

        const commento = document.getElementById('overlay-reviewText').value;
        const rankGusto = parseFloat(document.getElementById('rating-value-gusto').textContent)
        const rankDifficolta = parseFloat(document.getElementById('rating-value-difficolta').textContent)

        if (!commento || !rankGusto || !rankDifficolta) {
            alert("Perfavore, inserisci sia una valutazione che un commento")
            return
        }

        let recensioni = JSON.parse(localStorage.getItem('recensioni')) || []
        recensioni = recensioni.map(review => Object.assign(new Recensione(), review))

        let recensione = recensioni.find(review => review.idPasto === idMeal)

        if (recensione) {
            recensione.modificaValutazione(utenteLoggato.username, rankGusto, rankDifficolta, commento);
            localStorage.setItem('recensioni', JSON.stringify(recensioni))

            document.getElementById('review-overlay').style.display = 'none'
            document.getElementById('review').innerHTML = printReview(idMeal)
            window.location.reload();
        } else {
            console.error(`Recensione per il pasto con ID ${idMeal} non trovata.`)
        }
    } catch(error) {
        window.location.href = 'error.html'
        console.log("Error in editReview: " , error) 
    }
    
}

function setupStarRating(starContainerId, ratingValueId) {

    const stars = document.querySelectorAll(`#${starContainerId} .star`)
    const ratingValue = document.getElementById(ratingValueId)

    stars.forEach(star => {
        star.addEventListener('click', function(event) {
            // Ottieni il valore numerico della stella cliccata
            const value = parseFloat(event.target.getAttribute('data-value'))
            
            // Calcola la posizione del clic rispetto alla larghezza della stella
            const rect = event.target.getBoundingClientRect()
            const x = event.clientX - rect.left // Posizione del clic rispetto al bordo sinistro
            const width = rect.width// Larghezza totale della stella
            
            // Determina il voto (mezzo o pieno) in base al punto cliccato
            const isHalf = x < width / 2
            const rating = isHalf ? value - 0.5 : value

            // Aggiorna il valore visualizzato
            ratingValue.textContent = rating.toFixed(1)

            // Aggiorna graficamente le stelle
            updateStars(stars, rating)
        })
    })
}

function updateStars(stars, rating) {
    stars.forEach(star => {
        const value = parseFloat(star.getAttribute('data-value'))

        if (value <= rating) {
            // Stella piena
            star.src = 'img/star-fill.svg'
        } else if (value - 0.5 === rating) {
            // Stella a metà
            star.src = 'img/star-half.svg'
        } else {
            // Stella vuota
            star.src = 'img/star.svg'
        }
    })
}

function generateStars(rating) {
    let starsHtml = ''
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            starsHtml += '<img src="img/star-fill.svg" class="star-no-pointer">'
        } else if (i - 0.5 === rating) {
            starsHtml += '<img src="img/star-half.svg" class="star-no-pointer">'
        } else {
            starsHtml += '<img src="img/star.svg" class="star-no-pointer">'
        }
    }
    return starsHtml
}


