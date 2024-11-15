// ==UserScript==
// @name         Instagram Tinder
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  try to take over the world!
// @author       You
// @match        https://www.instagram.com/explore/people/
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(async function() {
    'use strict';

    console.log("TINDER STARTED!!!")

    const profilesContainer = document.querySelector("section > main > div > div:nth-child(2) > div > div");

    while (
        Array.from(profilesContainer.children).length < 30 ||
        !(Array.from(profilesContainer.children).pop()).innerText
    ) {
        console.log("Waiting for those juicy profiles")
        await new Promise(resolve => setTimeout(resolve, 500))
    }

    function getDataFromProfile(profile) {
        const actualProfileData = profile.querySelector("div > div > div > div > div > div > div > div")

        const profileImageSrc = actualProfileData.querySelector("img").src

        const profileTextDataEl = actualProfileData.querySelector("div:nth-child(2) > div > div")

        const username = profileTextDataEl.querySelector("div").innerText
        const name = profileTextDataEl.querySelector("span:nth-child(2)").innerText ?? username
        const followedBy = profileTextDataEl.querySelector("span:nth-child(3)").innerText

        const followButton = function() {
            actualProfileData.querySelector("div:nth-child(3) button").click()
        }

        return {
            username,
            name,
            followedBy,
            "followButton": followButton,
            profileImageSrc
        }
    }

    function turnProfileIntoHTML(profile) {
        return `
          <div class="suggestion-card" data-username="${profile.username}">
	    <img src="${profile.profileImageSrc}" alt="${profile.username}">
	    <h2>${profile.username}</h3>
	    <h3>${profile.name}</h3>
	    <p>${profile.followedBy}</p>
	  </div>
        `
    }


    const profiles = Array.from(profilesContainer.children).map(profile => {
        return getDataFromProfile(profile)
    })

    profilesContainer.style.display = "none";

    profilesContainer.parentElement.innerHTML += `
    <div id="suggestions" class="suggestions-container">
	</div>
    `

    const suggestionsContainer = document.getElementById('suggestions');

    profiles.forEach(profile => suggestionsContainer.innerHTML += turnProfileIntoHTML(profile))

    let currentIndex = 0;

    function showCurrentSuggestion() {
        const cards = document.querySelectorAll('.suggestion-card');
        cards.forEach((card, index) => {
            card.style.display = index === currentIndex ? 'block' : 'none';
        });
    }

    async function followUser(username, currentIndex) {
        console.log(`Following ${username}...`);
	profiles[currentIndex].followButton.click()
    }

    function handleSwipe(action) {
        const currentCard = document.querySelectorAll('.suggestion-card')[currentIndex];
        const username = currentCard.getAttribute('data-username');

        if (action === 'right') {
            followUser(username, currentIndex);
        }

        currentIndex++;
        if (currentIndex < document.querySelectorAll('.suggestion-card').length) {
            showCurrentSuggestion();
        } else {
            suggestionsContainer.innerHTML = '<h3>No more suggestions!</h3>';
        }
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') {
            handleSwipe('right');
        } else if (event.key === 'ArrowLeft') {
            handleSwipe('left');
        }
    });

    // Initial setup
    showCurrentSuggestion();
})();
