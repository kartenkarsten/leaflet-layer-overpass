# Leaflet Layer OverPass

This plugin is a fork of https://github.com/kartenkarsten/leaflet-layer-overpass

Here is a list of changes made after the fork:

* Replace `{{bbox}}` instead of `BBOX` in Overpass requests
* Code cleanup

 * JSHint warnings fixed
 * Tabs instead of spaces for indentation
 * Spaces between blocks

* Options are now in camelCase: `endpoint` is `endPoint` and so on
* Rename the `callback` option to `onSuccess`
* Add the `timeout` option
* Add the `onError` and `onTimeout` callbacks
* Add the ability to retry a request when it returned a timeout
* If beforeRequest return false, the request is not launched
* Add the noInitialRequest option to prevent the initial request to be launched if necessary


The first release of this fork is the version **1.1.0**.


## What is it?
A [Leaflet](http://leafletjs.com/) plugin to create a custom POI overlay - thanks to the [OSM](http://www.openstreetmap.org/) dataset and the [Overpass API](http://overpass-api.de/)

checkout the [demo](http://kartenkarsten.github.io/leaflet-layer-overpass/demo/)


## Installation
You can use bower to install leaflet-layer-overpass.

Simply run
```bash
$ bower install --save leaflet-layer-overpass
```
After that you can include and use the `OverpassLayer.css` and `OverpassLayer.js` files (or `OverPassLayer.min.js` if you want the minified version) from the `dist` folder in your html.

## How to use it?
```javascript
var attr_osm = 'Map data &copy; <a href="http://openstreetmap.org/">OpenStreetMap</a> contributors',

attr_overpass = 'POI via <a href="http://www.overpass-api.de/">Overpass API</a>',

osm = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {

    'opacity': 0.7,
    'attribution': [attr_osm, attr_overpass].join(', ')
}),

map = new L.Map('map')
.addLayer(osm)
.setView(new L.LatLng(52.265, 10.524), 14),

opl = new L.OverPassLayer({

    query: 'node({{bbox}})['amenity'='post_box'];out;',
});

map.addLayer(opl);
```
In order to get a valid query the [Overpass-turbo IDE](http://overpass-turbo.eu/) might help.

## What are the options?
You can specify an options object as an argument of L.OverPassLayer.
```javascript
options: {

  'minZoom': 15,
  'requestPerTile': true,
  'endPoint': 'http://overpass.osm.rambler.ru/cgi/',
  'query': 'node({{bbox}})["amenity"="post_box"];out;',
  'timeout': 30 * 1000, // Milliseconds
  'minZoomIndicatorOptions': {

    'position': 'topright',
    'minZoomMessageNoLayer': 'no layer assigned',
    'minZoomMessage': 'current Zoom-Level: CURRENTZOOM all data at Level: MINZOOMLEVEL'
},
  'beforeRequest': function() {},
  'afterRequest': function() {},
  'onSuccess': function(data) {},
  'onError': function(xhr) {},
  'onTimeout': function(xhr) {},
};
```

## Used by
- [Gdzie](http://gdzie.bl.ee/#!7/51.495/20.995/)
- [pois.elblogdehumitos.com.ar](http://pois.elblogdehumitos.com.ar/)
- [briefkastenkarte.de](http://briefkastenkarte.de/)

## Dependencies
- Leaflet (tried with version 0.6.2, 0.7.3)

## Development

*Warning: This fork use Git Flow to manage branches.*

In order to contribute to the project you should first clone the repository. The javascript source files
reside in the `src` folder and are concatenated and minified by gulp. If you want to make changes
make them in the `src` folder and then build the `dist` file with gulp.
For that you first need to install gulp if you do not have installed it yet
```
$ npm install --global gulp
```
Then install all the needed packages for this project:
```
$ npm install
```
And then just run
```
gulp
```
after you made your changes. This will combine (and minify) the files and put them into the `dist` folder.
