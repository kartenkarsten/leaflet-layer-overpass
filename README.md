Leaflet Layer OverPass
=============================
[![Bower version](https://badge.fury.io/bo/leaflet-layer-overpass.svg)](http://badge.fury.io/bo/leaflet-layer-overpass)

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
attr_overpass = 'POI via <a href="http://www.overpass-api.de/">Overpass API</a>';
var osm = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {opacity: 0.7, attribution: [attr_osm, attr_overpass].join(', ')});

var map = new L.Map('map').addLayer(osm).setView(new L.LatLng(52.265, 10.524), 14);

//OverPassAPI overlay
var opl = new L.OverPassLayer({
  query: "node(BBOX)['amenity'='post_box'];out;",
});

map.addLayer(opl);
```
In order to get a valid query the [Overpass-turbo IDE](http://overpass-turbo.eu/) might help.

## What are the options?
You can specify an options object as an argument of L.OverPassLayer.
```javascript
options: {
  endpoint: "http://overpass.osm.rambler.ru/cgi/",
  query: "node(BBOX)['amenity'='post_box'];out;",
  debug: false,
  callback: function(data) {
    for(var i=0;i<data.elements.length;i++) {
      var e = data.elements[i];

      if (e.id in this.instance._ids) return;
      this.instance._ids[e.id] = true;
      var pos = new L.LatLng(e.lat, e.lon);
      var popup = this.instance._poiInfo(e.tags,e.id);
      var color = e.tags.collection_times ? 'green':'red';
      var circle = L.circle(pos, 50, {
        color: color,
        fillColor: '#fa3',
        fillOpacity: 0.5
      })
      .bindPopup(popup);
      this.instance.addLayer(circle);
    }
  },
  minZoomIndicatorOptions: {
    position: 'topright',
    minZoomMessageNoLayer: "no layer assigned",
    minZoomMessage: "current Zoom-Level: CURRENTZOOM all data at Level: MINZOOMLEVEL"
  }
};
```

## Used by
- [Gdzie](http://gdzie.bl.ee/#!7/51.495/20.995/)
- [pois.elblogdehumitos.com.ar](http://pois.elblogdehumitos.com.ar/)
- [briefkastenkarte.de](http://briefkastenkarte.de/)

## Dependencies
- Leaflet (tried with version 0.6.2, 0.7.3)

## Development
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


## Further Ideas
- OverPass result to -> geoJSON to -> Leaflet Layer to support ways and areas as well (see also [PoiMap](https://github.com/simon04/POImap/blob/master/railway.html), [OverPassTurbo](https://github.com/tyrasd/overpass-ide/blob/gh-pages/js/overpass.js))
- improve popup text. use links, format addresses and contact details (compare with [OpenLinkMap](http://www.openlinkmap.org/))
- improve caching - allow to store data for some days in browser

