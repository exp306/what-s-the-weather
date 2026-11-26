# Atmos Weather App

A responsive weather dashboard built with plain HTML, CSS, and JavaScript.

## Features
- Search for a city by name
- Current temperature, feels-like temperature, condition, humidity, wind speed, and UV index
- Three-day forecast (high/low and condition)
- Sunrise and sunset times
- Helpful invalid-city and network error messages
- Weather ambience: animated rain, drifting clouds, and a soft sunny glow
- Small in-page Visual edit mode for changing text and styling
- Remembers the last searched city and visual edits in localStorage
- Responsive layout for desktop and mobile

## Run it
1. Extract the ZIP.
2. Open the folder in VS Code.
3. Install the **Live Server** extension if you do not already have it.
4. Right-click `index.html` and choose **Open with Live Server**.
5. Search for a city.

You can also use any local static web server. Avoid opening the file directly with `file://` if your browser blocks API requests.

## Weather API
This project uses the free Open-Meteo Geocoding API to convert a city name into coordinates, then the Open-Meteo Forecast API to retrieve current conditions and daily forecast. No API key is required.

- https://geocoding-api.open-meteo.com/
- https://open-meteo.com/en/docs

## Visual edit mode
Click **Visual edit**, then click a heading, text, or weather/forecast card. You can adjust text (for simple text elements), text color, font size, padding, and background color. Changes are stored in this browser's localStorage.

This is a lightweight editor built into the app, not a full Lovable-style visual builder. It does not provide drag-and-drop layout editing, image uploads, or a collaborative prompt queue.
