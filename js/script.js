const countryName = document.querySelector('.country__name')
const countryPopulaton = document.querySelector('.country__population')
const countryRegion = document.querySelector('.country__region')
const countryCapital = document.querySelector('.country__capital')
const countryFlag= document.querySelector('.country__flag')
const preLoader = document.querySelector('.preloader')
const appContainer = document.querySelector('.app')
const mode = document.querySelector('.mode')
const whereInTheWorld = document.querySelector('.app-header')
let input 
let filter


//fetching the data from rest countries API,sorting it alphabeticaly and calls displayFetchedData()
const fetchCountriesApi= async function(){
    try{
        let response = await fetch(`https://restcountries.com/v3.1/all`)
        let responseJson = await response.json()
      
        let sorted = responseJson.sort((a,b)=>{
        let namea = a.name.common.toLowerCase();
        let nameb = b.name.common.toLowerCase()
        if (namea < nameb) {
            return -1;
        }
        if (namea > nameb) {
            return 1;
        }
        return 0;
       })
       //storing the fetched data in local storage
       window.localStorage.setItem('fetched', JSON.stringify(sorted))
       
displayFetchedData()
}
    catch(err){
        alert(err)
    }
}


//displays the fetched data to UI and adds click event listener to each of the countries, which leads to it's detailed data
const displayFetchedData = function(){

const fetchedData = JSON.parse(window.localStorage.getItem(localStorage.key(0)))
//displaying the search and region filter
const customizeDiv= document.createElement('div')
customizeDiv.setAttribute('class','customize')
customizeDiv.innerHTML = `
<input type="text" id='customize__search' name="customize__search" placeholder="Search for a country...">
<label for="customize__search" hidden>Search a country</label>
<select name="customize__filter" id="customize__filter">
<option value="placeholder">Filter by Region</option>
<option value="africa">Africa</option>
<option value="america">America</option>
<option value="asia">Asia</option>
<option value="europe">Europe</option>
<option value="oceania">Oceania</option>
</select>
<label for="customize__filter" hidden>Filter by Region</label>
`
appContainer.prepend(customizeDiv)

input = document.querySelector('#customize__search')
filter = document.querySelector('#customize__filter')
//listening for input changes in the search
input.addEventListener('input', searchCountry)
//listening for dropdown value changes filter
filter.addEventListener('change', filterCountry)


countriesContainer = document.createElement('div')
countriesContainer.setAttribute('class','countries-container')
appContainer.append(countriesContainer)
    //looping trough trough the fetched data, creating div containing country data for each of them and append it to the country-container
 fetchedData.forEach(country=>{
     let div = document.createElement('div')
     div.setAttribute('class','country')
     div.innerHTML = `
     <img src= ${country.flags.png ?? 'undefined'} alt="" class="country__flag">
     <div class='country__data'>
     <h2 class="country__name">${country.name.common ?? 'undefined'}</h2>
     <p class="country__population"><span>Population:</span> ${country.population.toLocaleString('en-US') ?? 'undefined'}</p>
     <p class="country__region"><span>Region:</span> ${country.region ?? 'undefined'}</p>
     <p class="country__capital"><span>Capital:</span> ${country.capital ?? 'undefined'}</p></div>`
     countriesContainer.append(div)
    

     div.addEventListener('click', ()=>{
     window.sessionStorage.clear()
     window.sessionStorage.setItem(`${country.name.common}`,JSON.stringify(country))

     const state = { 'page_id':country.name.common, }
     const url = `${country.name.common}`
     history.pushState(state, '', url)

     updateUIdetailedCountry()
    })
    
    })
//hidding the preLoad spinner
    preLoader.style.display = 'none'
    }

// displays the detailed data of a country
const displayDetailedCountry = function(country){
    detailedCountry = document.createElement('div')
    detailedCountry.setAttribute('class','detailed-country')
    
    appContainer.innerHTML = ` `
    detailedCountry.innerHTML = `
    <button id='back'>&larr; Back</button>
    <div class='country-data'>
    <img src=${country.flags.png ?? 'undefined'}> </img>
    <div class='country-data__main'>
    <h1>${country.name.common ?? 'undefined'}</h1>
    <p><span>Nativ Name: </span>${Object.values(country.name.nativeName ?? {official:'undefined'})[0].official}</p>
    <p><span>Population: </span>${country.population.toLocaleString('en-US') ?? 'undefined'}</p>
    <p><span>Region: </span>${country.region ?? 'undefined'}</p>
    <p><span>Sub Region: </span>${country.subregion ?? 'undefined'}</p>
    <p><span>Capital: </span>${country.capital ?? 'undefined'}</p>
    </div>
    <div class='country-data__secondary'>
    <p><span>Top Level Domain: </span>${(country.tld)?.toString()}</p>
    <p><span>Currencies: </span>${Object.values(country.currencies ?? {official:'undefined'})[0].name}</p>
    <p><span>Languages: </span>${Object.values(country.languages ?? {official:'undefined'}).join(', ')}
    </p>
    </div>
    <div class='border-countries'>
    <h2>Border Countries:</h2>
    <p class='container'></p>
    </div>
    </div>
    `
    appContainer.append(detailedCountry)

    //going back -1 in in history on click
    const buttonBack =document.querySelector('#back')
    buttonBack.addEventListener('click',()=>{
    history.back()
 }) 
}

//dispalys the border countries of the showed detailed country, also sets click event listener to each border leading to it's detailed data
const displayDetailedCountryBorders= function(currentCountry,allCountries,typeofbuild){
   currentCountry.borders?.forEach(lang=>{

        allCountries.forEach(element =>{
             if(Object.values(element).includes(lang)){
                const borderCountry = document.createElement('a')
                borderCountry.innerHTML = `
                ${element.name.common}`
                document.querySelector('.container').append(borderCountry)

                   
            borderCountry.addEventListener('click', function(){
                window.sessionStorage.clear()
                window.sessionStorage.setItem(`${element.name.common}`,JSON.stringify(element))
                country = JSON.parse(window.sessionStorage.getItem(sessionStorage.key(0)))

                const state = { 'page_id':country.name.common, }
                const url = `${country.name.common}`
                history.pushState(state, '', url)
                typeofbuild(country)
                })
                }
        
            })
             })}

             //upadetes UI with the detailed country data and borders 
             const updateUIdetailedCountry = function(){

                const country = JSON.parse(window.sessionStorage.getItem(sessionStorage.key(0)))
                const data = JSON.parse(window.localStorage.getItem(localStorage.key(0)))
                
                const buildUIonClick = function(country){
                displayDetailedCountry(country)
                displayDetailedCountryBorders(country,data,buildUIonClick)
                }
                
                buildUIonClick(country)
                }
            
             
//display or hide country depending on search input
function searchCountry(){
 //storing the input value
    let inputLower = input.value.toLowerCase();
    let countryName = document.querySelectorAll('.country__name')
 
    //looping trough node list of the countries, checking each country if it contains the search input value,if it does we display the country div, otherwise we hide it.
    for(i=0; i<countryName.length; i++){
      
        if(!countryName[i].innerHTML.toLowerCase().includes(inputLower)){    
            countryName[i].parentElement.parentElement.style.display = 'none'
        }
        else{
            countryName[i].parentElement.parentElement.style.display= 'block'
        }
    }
    
}

//display or hide country depending on filter country value
function filterCountry(){
let countryRegion = [...document.querySelectorAll('.country__region')]

if(filter.value == 'placeholder'){
    countryRegion.forEach(element =>{
        element.parentElement.parentElement.style.display='block'
        })
    }

else{
    countryRegion.forEach(element => {
       if(!element.innerHTML.toLowerCase().includes(filter.value)){
       
        element.parentElement.parentElement.style.display='none'
    }
       else{
        element.parentElement.parentElement.style.display='block'
    }
})
}
}


//update UI with all the fetched data
const loadCountries = function(){
   //first time load, data not fetched previously
    if(!localStorage.key('fetched')){
    fetchCountriesApi()
}

     //loading countries if we already have fetched the data in our local storage, to prevent making api requests every load
    else{
        displayFetchedData()
    }
}

//listening for popstate and updating UI on change
window.addEventListener('popstate', function(){
    const buildUIonPopState = function(){
    const data = JSON.parse(localStorage.getItem(localStorage.key(0)))
    data.forEach(element=>{
        // removing symols from the location.path and also removing spaces from country names to allow a 'include' check for countries with 2 or more words in their name
        const locationPath = location.pathname.replace(/[^a-zA-Z ]/g, "")
        const name = element.name.common.replace(' ','')

        if(locationPath.includes(name)){
        displayDetailedCountry(element)
        displayDetailedCountryBorders(element,data,buildUIonPopState)
     }

    })
 }
    if(location.pathname !== '/World-Countries/'){
    buildUIonPopState()}
    else {
        document.querySelector('.detailed-country').remove()
        loadCountries()
        input.addEventListener('input', searchCountry)
        filter.addEventListener('change', filterCountry)
    }
 })
 


loadCountries()



//changing color mode on click
mode.addEventListener('click',function(){
    const body = document.querySelector('body')
    if(body.classList.contains('mode-dark')){
        body.classList.remove('mode-dark')
        mode.lastElementChild.innerHTML = `Dark Mode`
    }
    else{
        body.classList.add('mode-dark')
        mode.lastElementChild.innerHTML = `Light Mode`
    }
})

//display initial UI on h1 click
whereInTheWorld.addEventListener('click', function(){
    appContainer.innerHTML = ``
    loadCountries()
    const state = { 'page_id': 'home-page'}
    const url = '/World-Countries/'
    history.pushState(state, '', url)
})
