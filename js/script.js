const countryName = document.querySelector(".country__name");
const countryPopulaton = document.querySelector(".country__population");
const countryRegion = document.querySelector(".country__region");
const countryCapital = document.querySelector(".country__capital");
const countryFlag = document.querySelector(".country__flag");
const preLoader = document.querySelector(".preloader");
const appContainer = document.querySelector(".app");
const mode = document.querySelector(".mode");
const whereInTheWorld = document.querySelector(".app-header");
let input;
let filter;

//fetching the data from rest countries API,sorting it alphabeticaly and calls displayFetchedData()
const fetchCountriesApi = async function () {
  try {
    const { data: countries } = await axios.get(
      "https://restcountries.com/v3.1/all"
    );

    countries.sort((a, b) =>
      a.name.common.toLowerCase().localeCompare(b.name.common.toLowerCase())
    );

    localStorage.setItem("fetched", JSON.stringify(countries));

    displayFetchedData();
  } catch (err) {
    alert(err);
  }
};

//displays the fetched data to UI and adds click event listener to each of the countries, which leads to it's detailed data
const displayFetchedData = function () {
  const fetchedData = JSON.parse(
    window.localStorage.getItem(localStorage.key(0)) // Retrieve fetched data from local storage
  );

  // Create search and filter elements
  const customizeDiv = document.createElement("div");
  customizeDiv.setAttribute("class", "customize");
  customizeDiv.innerHTML = `
      <input type="text" id='customize__search' name="customize__search" placeholder="Search for a country..."> <!-- Search input field -->
      <label for="customize__search" hidden>Search a country</label>
      <select name="customize__filter" id="customize__filter"> <!-- Region filter dropdown -->
        <option value="placeholder">Filter by Region</option>
        <option value="africa">Africa</option>
        <option value="americas">America</option>
        <option value="asia">Asia</option>
        <option value="europe">Europe</option>
        <option value="oceania">Oceania</option>
      </select>
      <label for="customize__filter" hidden>Filter by Region</label>
    `;
  appContainer.prepend(customizeDiv);

  // Get input and filter elements
  input = document.querySelector("#customize__search");
  filter = document.querySelector("#customize__filter");

  // Add event listeners for search input and region filter
  input.addEventListener("input", searchCountry);
  filter.addEventListener("change", filterCountry);

  // Create container for countries
  countriesContainer = document.createElement("div");
  countriesContainer.setAttribute("class", "countries-container");
  appContainer.append(countriesContainer);

  // Loop through fetched data and create country elements
  fetchedData.forEach((country) => {
    // Create country div
    let div = document.createElement("div");
    div.setAttribute("class", "country");

    // Populate country data into the div
    div.innerHTML = `
        <img src= ${
          country.flags.png ?? "undefined"
        } alt="" class="country__flag"> <!-- Country flag -->
        <div class='country__data'>
          <h2 class="country__name">${
            country.name.common ?? "undefined"
          }</h2> <!-- Country name -->
          <p class="country__population"><span>Population:</span> ${
            country.population.toLocaleString("en-US") ?? "undefined" // Country population
          }</p>
          <p class="country__region"><span>Region:</span> ${
            country.region ?? "undefined" // Country region
          }</p>
          <p class="country__capital"><span>Capital:</span> ${
            country.capital ?? "undefined" // Country capital
          }</p>
        </div>`;

    // Append country div to the countries container
    countriesContainer.append(div);

    // Add click event listener for each country div
    div.addEventListener("click", () => {
      // Store country data in session storage
      window.sessionStorage.clear();
      window.sessionStorage.setItem(
        `${country.name.common}`,
        JSON.stringify(country)
      );

      // Push state to history for navigation
      const state = { page_id: country.name.common };
      const url = `${country.name.common}`;
      history.pushState(state, "", url);

      // Update UI with detailed country data
      updateUIdetailedCountry();
    });
  });

  // Hide preloader once data is displayed
  preLoader.style.display = "none";
};

// Display the detailed data of a country
const displayDetailedCountry = function (country) {
  // Create a div for detailed country data
  const detailedCountry = document.createElement("div");
  detailedCountry.setAttribute("class", "detailed-country");

  // Clear the content of the app container
  appContainer.innerHTML = "";

  // Populate detailed country data
  detailedCountry.innerHTML = `
      <button id='back'>&larr; Back</button>
      <div class='country-data'>
        <img src=${country.flags.png ?? "undefined"}> </img>
        <div class='country-data__main'>
          <h1>${country.name.common ?? "undefined"}</h1>
          <p><span>Nativ Name: </span>${
            Object.values(
              country.name.nativeName ?? { official: "undefined" }
            )[0].official
          }</p>
          <p><span>Population: </span>${
            country.population.toLocaleString("en-US") ?? "undefined"
          }</p>
          <p><span>Region: </span>${country.region ?? "undefined"}</p>
          <p><span>Sub Region: </span>${country.subregion ?? "undefined"}</p>
          <p><span>Capital: </span>${country.capital ?? "undefined"}</p>
        </div>
        <div class='country-data__secondary'>
          <p><span>Top Level Domain: </span>${country.tld?.toString()}</p>
          <p><span>Currencies: </span>${
            Object.values(country.currencies ?? { official: "undefined" })[0]
              .name
          }</p>
          <p><span>Languages: </span>${Object.values(
            country.languages ?? { official: "undefined" }
          ).join(", ")}
          </p>
        </div>
        <div class='border-countries'>
          <h2>Border Countries:</h2>
          <p class='container'></p>
        </div>
      </div>
    `;

  // Append detailed country data to the app container
  appContainer.append(detailedCountry);

  // Add click event listener to the back button to navigate back in history
  const buttonBack = document.querySelector("#back");
  buttonBack.addEventListener("click", () => {
    history.back();
  });
};

// Display the border countries of the showed detailed country
const displayDetailedCountryBorders = function (
  currentCountry,
  allCountries,
  typeofbuild
) {
  // Iterate through the borders of the current country
  currentCountry.borders?.forEach((lang) => {
    // Find the bordering country by comparing languages
    const borderingCountry = allCountries.find((element) =>
      Object.values(element).includes(lang)
    );

    // If bordering country is found
    if (borderingCountry) {
      // Create an anchor element for the bordering country
      const borderCountry = document.createElement("a");
      borderCountry.innerHTML = `${borderingCountry.name.common}`;

      // Append the bordering country to the container
      document.querySelector(".container").append(borderCountry);

      // Add click event listener to display detailed data of the bordering country
      borderCountry.addEventListener("click", function () {
        // Clear session storage and store bordering country's data
        window.sessionStorage.clear();
        window.sessionStorage.setItem(
          `${borderingCountry.name.common}`,
          JSON.stringify(borderingCountry)
        );

        // Retrieve stored country data
        const country = JSON.parse(
          window.sessionStorage.getItem(sessionStorage.key(0))
        );

        // Update URL and history state
        const state = { page_id: country.name.common };
        const url = `${country.name.common}`;
        history.pushState(state, "", url);

        // Call typeofbuild function to display detailed data of the bordering country
        typeofbuild(country);
      });
    }
  });
};

//upadetes UI with the detailed country data and borders
const updateUIdetailedCountry = function () {
  // Retrieve the currently selected country from session storage
  const country = JSON.parse(
    window.sessionStorage.getItem(sessionStorage.key(0))
  );

  // Retrieve all fetched countries data from local storage
  const data = JSON.parse(window.localStorage.getItem(localStorage.key(0)));

  // Define a function to build UI on click event
  const buildUIonClick = function (country) {
    // Display detailed country data
    displayDetailedCountry(country);

    // Display detailed country borders
    displayDetailedCountryBorders(country, data, buildUIonClick);
  };

  // Call the buildUIonClick function to update UI with detailed country data
  buildUIonClick(country);
};
////////////////tohere
// Display or hide countries based on search input
function searchCountry() {
  // Get the search input value and convert it to lowercase
  const inputLower = input.value.toLowerCase();
  // Get the selected region filter value and convert it to lowercase
  const filterLower = filter.value.toLowerCase();
  // Select all elements with class country__name
  const countryName = document.querySelectorAll(".country__name");

  // Loop through each country name element
  countryName.forEach((name) => {
    // Get the parent country div element to hide and show
    const countryDiv = name.parentElement.parentElement;

    // Get the country region to lowercase
    const countryRegion = countryDiv
      .querySelector(".country__region")
      .textContent.replace("Region:", "")
      .trim()
      .toLowerCase();

    // Determine whether to display or hide the country based on the search input and filter value
    const displayStyle =
      name.textContent.toLowerCase().includes(inputLower) &&
      (filterLower === "placeholder" || countryRegion === filterLower)
        ? "block"
        : "none";
    // Set the display style for the country div
    countryDiv.style.display = displayStyle;
  });
}

// Display or hide countries based on filter value
function filterCountry() {
  // Select all elements with class country__region
  const countryRegion = [...document.querySelectorAll(".country__region")];

  // Set the value of the filter
  const filterLower = filter.value.toLowerCase();

  // Loop through each country region element
  countryRegion.forEach((element) => {
    // Get the parent country div element to hide or show
    const countryDiv = element.parentElement.parentElement;
    // Determine whether to display or hide the country based on the filter value
    const displayStyle =
      filterLower === "placeholder" ||
      element.textContent.toLowerCase().includes(filterLower)
        ? "block"
        : "none";
    // Set the display style for the country div
    countryDiv.style.display = displayStyle;
  });
}

//update UI with all the fetched data
const loadCountries = function () {
  // Check if the fetched data is stored in local storage
  const fetchedData = localStorage.getItem("fetched");

  // If fetchedData is not null or undefined, display the fetched data
  if (fetchedData) {
    displayFetchedData();
  } else {
    // If fetchedData is null or undefined, fetch the data from the API
    fetchCountriesApi();
  }
};

//Function to handle popstate and update UI
const handlePopState = function () {
  // Get the current URL path
  const locationPath = location.pathname;

  // Check if the current URL path is not the homepage
  if (locationPath !== "/World-Countries/") {
    // Retrieve the last part of the URL path as the country name
    const countryName = locationPath.substring(
      locationPath.lastIndexOf("/") + 1
    );

    // Retrieve the country data from localStorage
    const allCountriesData = JSON.parse(localStorage.getItem("fetched"));
    const countryData = allCountriesData.find(
      (country) => country.name.common === countryName
    );

    // If country data exists, display detailed country information
    if (countryData) {
      displayDetailedCountry(countryData);

      // Display detailed country borders
      displayDetailedCountryBorders(
        countryData,
        allCountriesData,
        handlePopState
      );
    } else {
      console.error("Country data not found for", countryName);
    }
  } else {
    // If the current URL path is the homepage, remove detailed country information and load countries
    const detailedCountryElement = document.querySelector(".detailed-country");
    if (detailedCountryElement) {
      detailedCountryElement.remove();
    }
    loadCountries();
  }
};
// Add event listener for popstate
window.addEventListener("popstate", handlePopState);

//Initial fetch of country data(Local storage || API )
loadCountries();

//changing color mode on click
mode.addEventListener("click", function () {
  const body = document.body;
  const isDarkMode = body.classList.toggle("mode-dark");
  mode.lastElementChild.textContent = isDarkMode ? "Light Mode" : "Dark Mode";
});

// Display initial UI on h1 click
whereInTheWorld.addEventListener("click", function () {
  // Clear the content of the app container
  appContainer.innerHTML = "";

  // Load countries
  loadCountries();

  // Update history state
  const state = { page_id: "home-page" };
  const url = "/World-Countries/";
  history.pushState(state, "", url);
});
