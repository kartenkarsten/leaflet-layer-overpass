Leaflet Layer OverPass
=============================

## What is it ?
A [Leaflet](http://leafletjs.com/) Plugin to create a custom POI overlay - thanks to the [OSM](http://www.openstreetmap.org/)-Dataset and the [OverPass-API](http://overpass-api.de/)

checkout the [Demo](http://kartenkarsten.github.io/leaflet-layer-overpass/demo/)

## How to use it ?
```javascript
var attr_osm = 'Map data &copy; <a href="http://openstreetmap.org/">OpenStreetMap</a> contributors',
attr_overpass = 'POI via <a href="http://www.overpass-api.de/">Overpass API</a>';
var osm = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {opacity: 0.7, attribution: [attr_osm, attr_overpass].join(', ')});

var map = new L.Map('map').addLayer(osm).setView(new L.LatLng(52.265, 10.524), 14);

//OverPassAPI overlay
var opl = new L.OverPassLayer({
  query: "node(BBOX)['amenity'='post_box'];out;",
}

map.addLayer(opl);
```
In order to get an valid query the [Overpass-turbo IDE](http://overpass-turbo.eu/) might help.

## What are the options ?
You can specify an options object as an argument of L.OverPassLayer.
```javascript
options: {
  endpoint: "http://overpass.osm.rambler.ru/cgi/",
  query: "node(BBOX)['amenity'='post_box'];out;",
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


## Further Ideas
- OverPass result to -> geoJSON to -> Leaflet Layer to support ways and areas as well (see also [PoiMap](https://github.com/simon04/POImap/blob/master/railway.html), [OverPassTurbo](https://github.com/tyrasd/overpass-ide/blob/gh-pages/js/overpass.js))
- improve popup text. use links, format addresses and contact details (compare with [OpenLinkMap](http://www.openlinkmap.org/))
- improve caching - allow to store data for some days in browser

