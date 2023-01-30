# Moody Application
OVERVIEW:  
The moody web application uses Spotify data to collect your favourite songs on Spotify and sort and display them based on the current mood you’re in.

DESCRIPTION:  
Uses fetch requests to Spotify's API to acess a user's playlist data. Which is then sorted into mood using song data, such as song valence, energy, and danceability. Done using the react native framework.  

DESIGN:
1. Spotify colouring: For this web application a similar colour palette of Spotify was implemented to make the application more consistent with its main service, to Spotify users 
2. Minimalistic design: This web application has a very minimalistic UI design. The applications components blend in with the user experience instead of distracting them from actually using the application. This also ensures that users immediately know the purpose of the application and creates better loading times.
3. Easy to use: This UI was designed so it can be used by any and all demographics, expanding the potential target audience.

KNOWN ERRORS:  
1. Has to use 50 songs rather than whole list of playlist songs due to request limit
2. Must let it load fully before selecting mood
3. Errors appearing after selecting mood (could possibly be due to developer mode)


