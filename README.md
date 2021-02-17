# ar-vocal-project
AR Vocal Project is an audio reader drived by Voice Recognition

This project is experimental, it is provided "as is", without any warranty.
The documentation is very "lite", I'll try to improve it, as soon as possible.

The project is based on Node.js and on the framework Express.
The goal of the project is to develop a podcast reader, drived by voice recognition, using the Web Speech API.
My secondary goal was to install the application on a Rapsberry Pi 3, but the Speech Synthesis is not implemented on Rapsbian (maybe on other systems compatible with the Pi, like Ubuntu for example). Anyway, the application works fine on Windows, on Linux Fedora, and probably on Ubuntu (but I didn't have the time to test it). 

The MP3 files are not provided. 
You can integrate your own MP3 podcasts, by personalizing the "appconfig.json" file (change the "path" attribute below) :
```JSON
    {
      "id": 1,
      "name": "podcasts",
      "type": "podcast",
      "path": "C:/Users/YOUR_ACCOUNT/Documents/podcasts",
      "url" : "/searching/podcast",
      "keyword": "listen_podcast",
      "active": true,
      "parsing": true,
      "jsonServer": {
        "port": 3001
      }
    }
```
... then launch this script "catalog.js" to generate your own podcasts database in the "datas" directory :
```Javascript
cd catalog
node catalog.js
```

In the "appconfig.json" file, you can personnalize the parameters below :
```JSON
  "param": {
    "username": "Michel",
    "lang_std": "fr-FR",
    "search_limit": 5
  }
```

For the moment, the languages implemented are : fr-FR and en-US.
The "search_limit" can be increased... make your own tests ;).

In the "appconfig.json" file, it is possible to activate the items with IDs 10, 11 and 12, to test those options, and check if the Web Speech API works correctly. To to that, just fix the "active" property to "true" (and restart the app).

Before to start the app, you must install globally the package json-server :
```Javascript 
npm install -g json-server
```

To start the app, plug a headphone with microphone, and launch the command below :
```Javascript 
npm run start
```

If everything works correctly, the browser Chrome will be started automatically and the app will speak to you. 


