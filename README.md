Leaflet Layer OverPass
=============================

# What is it ?
A Leaflet Plugin to create a custom POI overlay - thanks to the OSM-Dataset and the OverPass-API

# How to use it ?
```javascript
var attr_osm = 'Map data &copy; <a href="http://openstreetmap.org/">OpenStreetMap</a> contributors',
attr_overpass = 'POI via <a href="http://www.overpass-api.de/">Overpass API</a>';
var osm = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {opacity: 0.7, attribution: [attr_osm, attr_overpass].join(', ')});

var map = new L.Map('map').addLayer(osm).setView(new L.LatLng(52.265, 10.524), 14);

//OverPassAPI overlay
var opl = new L.OverPassLayer({
  _map:map,
  query: "http://overpass-api.de/api/interpreter?data=[out:json];node(BBOX)[amenity=post_box];out;",
}

map.addLayer(opl);
```

# What are the options ?
You can specify an options object as an argument of L.OverPassLayer.
```javascript
options: {
  _map: map,//important! pass the map object
  query: "http://overpass-api.de/api/interpreter?data=[out:json];node(BBOX)[amenity=post_box];out;",
  callback: function(data) {
    for(i=0;i<data.elements.length;i++) {
      e = data.elements[i];

      if (e.id in this.instance._ids) return;
      this.instance._ids[e.id] = true;
      var pos = new L.LatLng(e.lat, e.lon);
      var popup = this.instance._poiInfo(e.tags);
      var color = e.tags.collection_times ? 'green':'red';
      var circle = L.circle(pos, 50, {
        color: color,
        fillColor: '#fa3',
        fillOpacity: 0.5
      })
      .bindPopup(popup)
      .addTo(this.instance._map);
    }
  },
};
```
