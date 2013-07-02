L.Control.MinZoomIdenticator = L.Control.extend({
	options: {
		position: 'bottomleft',
    },

    /**
     * map: layerId -> zoomlevel
     */
    _layers: {},

    /** TODO check if nessesary
     */
	initialize: function (options) {
		L.Util.setOptions(this, options);
        this._layers = new Object();
	},

    /**
     * adds a layer with minzoom information to this._layers
     */
    _addLayer: function(layer) {
        var minzoom = 15;
        if (layer.options.minzoom) {
            minzoom = layer.options.minzoom;
        }
        this._layers[layer._leaflet_id] = minzoom;
        this._updateBox(null);
    },
    
    /**
     * removes a layer from this._layers
     */
    _removeLayer: function(layer) {
        this._layers[layer._leaflet_id] = null;
        this._updateBox(null);
    },

    _getMinZoomLevel: function() {
        var minZoomlevel=-1;
        for(var key in this._layers) {
            if ((this._layers[key] != null)&&(this._layers[key] > minZoomlevel)) {
                minZoomlevel = this._layers[key];
            }
        }
        return minZoomlevel;
    },

    onAdd: function (map) {
        this._map = map;
        map.zoomIndecator = this;

        var className = this.className;
        container = this._container = L.DomUtil.create('div', className);
        container.style.fontSize = "2em";
        container.style.background = "#ffffff";
        container.style.backgroundColor = "rgba(255,255,255,0.7)";
        container.style.borderRadius = "10px";
        container.style.padding = "1px 15px";
        container.style.oppacity = "0.5";
        map.on('moveend', this._updateBox, this);
        this._updateBox(null);

        //        L.DomEvent.disableClickPropagation(container);
        return container;
    },

    onRemove: function(map) {
        L.Control.prototype.onRemove.call(this, map);
        map.off({
            'moveend': this._updateBox
        }, this);

        this._map = null;
    },

    _updateBox: function (event) {
        //console.log("map moved -> update Container...");
		if (event != null) {
            L.DomEvent.preventDefault(event);
        }
        var minzoomlevel = this._getMinZoomLevel();
        if (minzoomlevel == -1) {
            this._container.innerHTML = "no layer assigned";
        }else{
            this._container.innerHTML = "current Zoom-Level: "+this._map.getZoom()+" all data at Level: "+minzoomlevel;
        }

        if (this._map.getZoom() >= minzoomlevel) {
            this._container.style.display = 'none';
        }else{
            this._container.style.display = 'block';
        }
    },

  className : 'leaflet-control-minZoomIndecator'
});

L.LatLngBounds.prototype.toOverpassBBoxString = function (){
  var a = this._southWest,
      b = this._northEast;
  return [a.lat, a.lng, b.lat, b.lng].join(",");
}

L.OverPassLayer = L.FeatureGroup.extend({
  options: {
    minzoom: 15,
    query: "http://overpass-api.de/api/interpreter?data=[out:json];(node(BBOX)[organic];node(BBOX)[second_hand];);out qt;",
    callback: function(data) {
        if (this.instance._map == null) {
            console.error("_map == null");
        }
      for(i=0;i<data.elements.length;i++) {
        e = data.elements[i];

        if (e.id in this.instance._ids) return;
        this.instance._ids[e.id] = true;
        var pos = new L.LatLng(e.lat, e.lon);
        var popup = this.instance._poiInfo(e.tags,e.id);
        var circle = L.circle(pos, 50, {
            color: 'green',
            fillColor: '#3f0',
            fillOpacity: 0.5
        })
          .bindPopup(popup);
          this.instance.addLayer(circle);
      }
    }
  },

  initialize: function (options) {
    L.Util.setOptions(this, options);
    this._layers = {};
    // save position of the layer or any options from the constructor
    this._ids = {};
  },

  _poiInfo: function(tags,id) {
    var link = '<a href="http://www.openstreetmap.org/edit?editor=id&node='+id+'">Edit this entry in iD</a><br>';
    var r = $('<table>');
    for (key in tags)
      r.append($('<tr>').append($('<th>').text(key)).append($('<td>').text(tags[key])));
    return link + $('<div>').append(r).html();
  },

  onMoveEnd: function () {
    console.log("load Pois");

    if (this._map.getZoom() >= this.options.minzoom) {
        $.ajax({
          url: this.options.query.replace(/(BBOX)/g, this._map.getBounds().toOverpassBBoxString()),
          context: { instance: this },
          crossDomain: true,
          dataType: "json",
          data: {},
          success: this.options.callback
        });
    }
  },

  onAdd: function (map) {
      this._map = map;
      if (map.zoomIndecator) {
          this._zoomControl = map.zoomIndecator;
          this._zoomControl._addLayer(this);
      }else{
          this._zoomControl = new L.Control.MinZoomIdenticator();
          map.addControl(this._zoomControl);
          this._zoomControl._addLayer(this);
      }

      this.onMoveEnd();
      if (this.options.query.indexOf("(BBOX)") != -1) {
          map.on('moveend', this.onMoveEnd, this);
      }
      console.log("add layer");
  },

  onRemove: function (map) {
      console.log("remove layer");
      L.LayerGroup.prototype.onRemove.call(this, map);
      this._ids = {};
      this._zoomControl._removeLayer(this);

      map.off({
          'moveend': this.onMoveEnd
      }, this);

      this._map = null;
  },

  getData: function () {
    console.log(this._data);
    return this._data;
  }

});

//FIXME no idea why the browser crashes with this code
//L.OverPassLayer = function (options) {
//  return new L.OverPassLayer(options);
//};
