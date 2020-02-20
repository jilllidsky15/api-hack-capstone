'use strict';

const locationKey = 'c4314e461218a7';
const locationURL = 'https://us1.locationiq.com/v1/search.php';

const hikingKey = '200683797-e94ac7495e9e689dc27179e7604e5453';
const hikingURL = 'https://www.hikingproject.com/data/get-trails';

function displayResults(responseJson){
  $(".results-list").empty();
  for (let i = 0;  i < responseJson.trails.length; i++) {
    $('.results-list').append(`
    <li>
      <h3><a href="${responseJson.trails[i].url}">${responseJson.trails[i].name}</a></h3>
      <p>${responseJson.trails[i].location}</p>
      <p>${responseJson.trails[i].length} miles</p>
    </li>
    `)};
  $('.results').removeClass('hidden'); 
}

function createHikingURL(lat, lon) {
  return `${hikingURL}?lat=${lat}&lon=${lon}&key=${hikingKey}`;
}

// Pull lat and lon coordinates from json object
function useCoordinates(responseJson) {
  // console.log(responseJson);
  if (responseJson.length > 0) {
    const lat = responseJson[0].lat;
    const lon = responseJson[0].lon;
    const fullHikingURL = createHikingURL(lat, lon);

    fetch(fullHikingURL)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText);
      })
      .then(responseJson => displayResults(responseJson))
      .catch(err => {
        $('.js-error-message').removeClass('hidden').text(`Sorry! We couldn't find any trails matching your request! `);
      });
  }
}

function getCoordinates(queryCity, queryState, queryPostalcode) {
  const locationParams = {
    key: locationKey,
    format: 'json',
    city: queryCity,
    state: queryState,
    postalcode: queryPostalcode,
    country: "us",
  }
  // console.log(params);

  const locationString = formatLocationParams(locationParams);
  const fullLocationURL = locationURL + '?' + locationString;
  // console.log(fullLocationURL);

  fetch(fullLocationURL)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => useCoordinates(responseJson))
    .catch(err => {
      console.log(err);
      $('.js-error-message').removeClass('hidden').text(`Sorry! We couldn't find any trails matching your request!`);
    });
}

function formatLocationParams(locationParams) {
  const queryItems = Object.keys(locationParams)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(locationParams[key])}`)
  return queryItems.join('&');
}

// When the user submits the form
function watchForm() {
  $('form').submit(function (event) {
    event.preventDefault();
    $('.js-error-message').addClass('hidden');
    // What did the user input? Get the value of their input
    const inputCity = $('.city').val()
    const inputState = $('.state').val();
    const inputPostalcode = $('.postalcode').val();
    // console.log(inputCity, inputState, inputPostalcode);
    getCoordinates(inputCity, inputState, inputPostalcode);
  });
}

// When the page loads run these functions
$(function () {
  console.log('App loaded');
  watchForm();
});