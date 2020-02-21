'use strict';

const locationKey = '05f174bb5a634cfeb6111ff86e830812';
const locationURL = 'https://api.opencagedata.com/geocode/v1/json';

const hikingKey = '200683797-e94ac7495e9e689dc27179e7604e5453';
const hikingURL = 'https://www.hikingproject.com/data/get-trails';

function displayResults(responseJson) {
  $(".results-list").empty();
  for (let i = 0; i < responseJson.trails.length; i++) {
    $('.results-list').append(`
    <li class="item-container">
      <img src="${responseJson.trails[i].imgSmallMed}">
      <div class="description-container">
        <h3><a href="${responseJson.trails[i].url}">${responseJson.trails[i].name}</a></h3>
        <p>${responseJson.trails[i].location}</p>
        <p>Length: ${responseJson.trails[i].length} miles</p>
        <p>Rating: ${responseJson.trails[i].stars}/5</p>
      </div>
    </li>
    `)
  };
  $('.results').removeClass('hidden');
}

function createHikingURL(lat, lng) {
  return `${hikingURL}?lat=${lat}&lon=${lng}&key=${hikingKey}`;
}

// Pull lat and lng coordinates from json object
function useCoordinates(responseJson) {
  // console.log(responseJson);
  if (responseJson.results.length > 0) {
    const lat = responseJson.results[0].geometry.lat;
    const lng = responseJson.results[0].geometry.lng;
    const fullHikingURL = createHikingURL(lat, lng);
    // console.log(fullHikingURL);

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

function getCoordinates(queryPostalcode) {
  const locationParams = {
    key: locationKey,
    q: queryPostalcode,
    countrycode: "us",
    limit: 1,
  }
  // console.log(locationParams);

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
    const inputPostalcode = $('.postalcode').val();
    // console.log(inputPostalcode);
    getCoordinates(inputPostalcode);
  });
}

// When the page loads run these functions
$(function () {
  console.log('App loaded');
  watchForm();
});