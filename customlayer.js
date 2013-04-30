L.CustomLayer = L.Class.extend({
  options: {
    apiUrl: 'http://www.jugglingedge.com/feeds/createjson.php?CallBack=?',
    userID: "404",
    icons:{"juggling":
      L.icon({
        iconUrl: 'icons/conTag_1.png',
        iconSize: [32, 32],
        iconAnchor: [-32, 0],
        popupAnchor: [0, 0]
      }),
      "unicycle": L.icon({
        iconUrl: 'icons/conTag_2.png',
        iconSize: [32, 32],
        iconAnchor: [0, 35],
        popupAnchor: [0, 0]
      }),
      "acrobatics": L.icon({
        iconUrl: 'icons/conTag_3.png',
        iconSize: [32, 32],
        iconAnchor: [0, 32],
        popupAnchor: [0, 0]
      })
    },
    latlng: new L.LatLng(50, 4)
  },

  initialize: function (options) {
    L.Util.setOptions(this, options);
    // save position of the layer or any options from the constructor
    console.log("init");
  },

    onAdd: function (map) {
      this._map = map;
      console.log("G");
      this._loadPoi();
      

      // create a DOM element and put it into one of the map panes
      this._el = L.DomUtil.create('div', 'my-custom-layer leaflet-zoom-hide');
      map.getPanes().overlayPane.appendChild(this._el);

      // add a viewreset event listener for updating layer's position, do the latter
      map.on('viewreset', this._reset, this);
      this._reset();
    },

    onRemove: function (map) {
      // remove layer's DOM elements and listeners
      map.getPanes().overlayPane.removeChild(this._el);
      map.off('viewreset', this._reset, this);
    },

    _reset: function () {
      // update layer's position
      var pos = this._map.latLngToLayerPoint(this.options.latlng);
      //L.DomUtil.setPosition(this._el, pos);
    },

    _loadPoi: function () {
      console.log("load Pois");
        $.getJSON(this.apiUrl, {Data : "events", UserID : this.userID } , function(data) {
          //convert Conventions to a POI overlay
          for(i=0;i<data.length;i++) {
            var event = data[i];

            if (event.EventID in this.ids) return;
            this.ids[event.EventID] = event;
            if ((event.Lat == 0) && (event.Lng == 0)) {
              console.log(event.ShortTitle + " has no position");
              continue;
            }
            var pos = new L.LatLng(event.Lat, event.Lng);
            var icon = jongIcon;
            var popup = poiInfo(event);
            var marker = new L.Marker(pos, {icon: icon}).bindPopup(popup);
            this._map.addLayer(marker);
          }
        });
    }

});
//L.CustomLayer = function (options) {
//  return new L.CustomLayer(options);
//}
