import React from "react";
import { useState } from 'react';



/*
MOODY APPLICATION 
    Recommends songs based on selected mood, using a users spotify data


    KNOWN ERRORS:
        1. Must let it load fully before selecting mood
        2. Errors appearing after selecting mood (could possibly be due to developer mode)
*/



/*
SpotifyAuth FUNCTION
    Main component for the application
*/
function SpotifyAuth() {
    // Function variables
    const CLIENT_SECRET = "4da86a5ecc8043b89351f327c163334c"
    const CLIENT_ID = "b9c6e006ac214ba695f8e0f09d8dc8e0";
    const REDIRECT_URI = "http://localhost:3000";
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
    const TOKEN = "https://accounts.spotify.com/api/token"
    const [data, setData] = useState([]);
    const [displayData, setDisplayData] = useState([]);

    let accessToken = "";
    let refreshToken = "";
    let songIDArray = [];
    let songDataArray = [];
    let arr1 = [];
    let arr2 = [];
    let isLoggedin = false;
    let isLoaded = false;
    let gCode = "";


    /*
    RequestAuth FUNCTION
        Requests authentication for moody app to access users spotify information (oAuth)
    */
    function requestAuth(){
        localStorage.setItem("clientID", CLIENT_ID);
        localStorage.setItem("clientSecret", CLIENT_SECRET)
        let url = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&show_dialog=true&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private`;
        window.location.href = url;
    }


    if(new URLSearchParams(window.location.search).get("code")){
        handleRedirect();
        isLoggedin = true;
    } // Check if code is present in URL (means that they're loggin in)


    /*
    handleRedirect FUNCTION
        Retrieves the code from the URL and assigns to variable gCode
    */
    function handleRedirect(){
        let queryString = window.location.search;
        if (queryString.length > 0){
            let urlParams = new URLSearchParams(queryString);
            gCode = urlParams.get('code');
        }
        callAuthorizationApi();
    }
  

    /*
    callAuthorizationApi FUNCTION
        Spotify oAuth continued, retrieves access and refresh token using code 
    */
    function callAuthorizationApi(){
        let authParam = {
            method: 'POST',
            headers : {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Authorization' : 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET)
            },
            body : "grant_type=authorization_code&code=" + gCode + "&redirect_uri=" + REDIRECT_URI
        } // Parameters for the following fetch request
        
        fetch(TOKEN, authParam)
            .then(result => result.json())
            .then((data) => {
                accessToken = data.access_token;
                localStorage.setItem("accessToken", accessToken);
                refreshToken = data.refresh_token;
                localStorage.setItem("refreshToken", refreshToken);
                handleGetData();
            }) // Fetch call using api/token endpoint to get refresh and access tokens, and sets to local storage
    }


    /*
    handleGetData FUNCTION
        Series of API calls to retrieve all songs in a user's playlist, and corresponding song data
    */
    async function handleGetData() {
        let playlistParam = {
            method : "GET",
            headers : {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + accessToken
            }
        }; // Parameters for following playlist fetch 

        await fetch("https://api.spotify.com/v1/me/playlists", playlistParam) // Fetch call to recieve all playlist information

        .then(result => result.json())
        .then(data => {
            for (let i = 0; i < data.items.length; i++){
                var playlistTracksParam = {
                    method : "GET",
                    headers : {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + accessToken
                    }
                }; // Parameters for following playlist fetch 
    
                fetch(data.items[i].tracks.href, playlistTracksParam)
                .then(result => result.json())
                .then(data => {
                    for(let j = 0; j < data.items.length; j++){
                        var songHref = data.items[i].track.href
                        if (songHref.includes("track")){
                            // Assign song info
                            let songID = data.items[j].track.id;
                            let songName = data.items[j].track.name;
                            let albumArt = data.items[j].track.album.images[2];
                            let artist = data.items[j].track.artists[0].name;
                            let songHref = `https://open.spotify.com/track/${songID}`
                            songIDArray.push({songID, songName, albumArt, artist, songHref}); // Push into array for song information
                        }
                    }// Loop through all songs
                })
            }
        })
        setTimeout(getSongData, 1000); //Ensures loaded
    };


    /*
    getSongData FUNCTION
        Retrieves the song data required for mood sorting 
    */
    function getSongData(){
        songDataArray = songIDArray.sort((a, b) => 0.5 - Math.random()); //Randomise order of song info array
        songDataArray = songDataArray.splice(0, 50); // Take the first 50 of randomised songs to account for API request rate
        
        for(let i = 0; i < songDataArray.length; i++){
            var audioFeaturesParam = {
                method : "GET",
                headers : {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + accessToken
                }
            }; // Parameters for following playlist fetch 

            fetch("https://api.spotify.com/v1/audio-features/" + songDataArray[i].songID, audioFeaturesParam)
            .then(result => result.json())
            .then(data => {
                songDataArray[i].songDanceability = data.danceability;
                songDataArray[i].songEnergy = data.energy;
                songDataArray[i].songValence = data.valence;
            }) // Store danceability, energy, and valence values inside songDataArray


        }
        isLoaded = true;
        setData(songDataArray); // songDataArray is set as state for future use
    }


    /*
    happyDisplay FUNCTION
        Sort for happy mood on button push
    */
    function happyDisplay(){
        arr1 = [...data].sort((a, b) => b.songValence- a.songValence)
        arr2 = [arr1[0], arr1[1], arr1[2], arr1[3], arr1[4]]
        setDisplayData(arr2)
    }


    /*
    sadDisplay FUNCTION
        Sort for sad mood on button push
    */
    function sadDisplay(){
        arr1 = [...data].sort((a, b) => a.songValence- b.songValence)
        arr2 = [arr1[0], arr1[1], arr1[2], arr1[3], arr1[4]]
        setDisplayData(arr2)
    }


    /*
    danceDisplay FUNCTION
        Sort for dance mood on button push
    */
    function danceDisplay(){
        arr1 = [...data].sort((a, b) => b.songDanceability- a.songDanceability)
        arr2 = [arr1[0], arr1[1], arr1[2], arr1[3], arr1[4]]
        setDisplayData(arr2)
    }


    /*
    chillDisplay FUNCTION
        Sort for chill mood on button push
    */
    function chillDisplay(){
        arr1 = [...data].sort((a, b) => a.songDanceability- b.songDanceability)
        arr2 = [arr1[0], arr1[1], arr1[2], arr1[3], arr1[4]]

        setDisplayData(arr2)
    }


    /*
    logout FUNCTION
        Called when logout button is pressed
    */
    function logout(){
        isLoggedin = false; // Change html in return 
        window.location.href = REDIRECT_URI; // Reset URL
        
        // Reset local storage
        localStorage.setItem("accessToken", "");
        localStorage.setItem("refreshToken", "");
        localStorage.setItem("clientID", "");
        localStorage.setItem("clientSecret", "");
    }

    return (
    <div className="App">
        <header className="App-header">
            {!isLoggedin &&
                <div id="loginContainer">
                    <h1 id="welcomeMessage" className="welcomeInfo">Welcome to Moody!!</h1>
                    <h3 className="welcomeInfo">The app that determines which songs on Spotify to listen to based on your mood!!</h3>
                    <h4 className="welcomeInfo">Please login to your Spotify account to get started:</h4>
                    <button id="loginButton" onClick={requestAuth}>Login</button>
                    <h6 className="welcomeInfo">Note: This app uses Spotify's API and authentication to access your song data, please allow Moody permissions on the following screen</h6>
                </div>
            }
            {(isLoggedin && !isLoaded) && 
                <>
                    <div id="header">
                    <button id="logoutButton" onClick={logout}>Logout</button>
                        <h1>Moody</h1>
                        <div id="buttonContainer" >
                            <button id="happyButton"  className="moodButton" onClick={happyDisplay}>Happy</button>
                            <button id="sadButton" className="moodButton" onClick={sadDisplay}>Sad</button>
                            <button id="danceButton" className="moodButton" onClick={danceDisplay}>Dance</button>
                            <button id="chillButton" className="moodButton" onClick={chillDisplay}>Chill</button>
                        </div>
                    </div>
                        {
                            displayData.map(song => (
                                <div id="songDisplayContainer">
                                    <div id="songDisplay">
                                        <img id="albumArt" src={ song.albumArt.url } />
                                        <a href={ song.songHref } target="_blank" id="songNameHref"><p id="songName">{ song.songName } - { song.artist }</p></a>
                                    </div>
                                </div>

                            ))
                        }
                </>
            }

        </header>
    </div>
  );
};

export default SpotifyAuth;