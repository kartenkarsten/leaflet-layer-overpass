L.LatLngBounds.prototype.toOverpassBBoxString = function (){
  var a = this._southWest,
  b = this._northEast;
  return [a.lat, a.lng, b.lat, b.lng].join(",");
}

L.OverPassLayer = L.FeatureGroup.extend({
  options: {
    debug: false,
    minzoom: 15,
    endpoint: "//overpass-api.de/api/",
    query: "(node(BBOX)[organic];node(BBOX)[second_hand];);out qt;",
    callback: function(data) {
      for(var i = 0; i < data.elements.length; i++) {
        var e = data.elements[i];

        if (e.id in this.instance._ids) continue;
        this.instance._ids[e.id] = true;
        var pos;
        if (e.type === "node") {
          pos = new L.LatLng(e.lat, e.lon);
        } else {
          pos = new L.LatLng(e.center.lat, e.center.lon);
        }
        var popup = this.instance._poiInfo(e.tags,e.id);
        var circle = L.circle(pos, 50, {
          color: 'green',
          fillColor: '#3f0',
          fillOpacity: 0.5
        })
        .bindPopup(popup);
        this.instance.addLayer(circle);
      }
    },
    beforeRequest: function() {
      if (this.options.debug) {
        console.debug('about to query the OverPassAPI');
      }
    },
    afterRequest: function() {
      if (this.options.debug) {
        console.debug('all queries have finished!');
      }
    },
    minZoomIndicatorOptions: {
      position: 'bottomleft',
      minZoomMessageNoLayer: "no layer assigned",
      minZoomMessage: "current Zoom-Level: CURRENTZOOM all data at Level: MINZOOMLEVEL"
    },
  },

  initialize: function (options) {
    L.Util.setOptions(this, options);
    this._layers = {};
    // save position of the layer or any options from the constructor
    this._ids = {};
    this._requested = {};
  },

  _poiInfo: function(tags,id) {
    var link = document.createElement("a");
    link.href = "//www.openstreetmap.org/edit?editor=id&node=" + id;
    link.appendChild(document.createTextNode("Edit this entry in iD"));
    var table = document.createElement('table');
    for (var key in tags){
      var row = table.insertRow(0);
      row.insertCell(0).appendChild(document.createTextNode(key));
      row.insertCell(1).appendChild(document.createTextNode(tags[key]));
    }
    var div = document.createElement("div")
    div.appendChild(link);
    div.appendChild(table);
    return div;
  },

  /**
  * splits the current view in uniform bboxes to allow caching
  */
  long2tile: function (lon,zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); },
  lat2tile: function (lat,zoom)  {
    return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom)));
  },
  tile2long: function (x,z) {
    return (x/Math.pow(2,z)*360-180);
  },
  tile2lat: function (y,z) {
    var n=Math.PI-2*Math.PI*y/Math.pow(2,z);
    return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
  },
  _view2BBoxes: function(l,b,r,t) {
    //console.log(l+"\t"+b+"\t"+r+"\t"+t);
    //this.addBBox(l,b,r,t);
    //console.log("calc bboxes");
    var requestZoomLevel= 14;
    //get left tile index
    var lidx = this.long2tile(l,requestZoomLevel);
    var ridx = this.long2tile(r,requestZoomLevel);
    var tidx = this.lat2tile(t,requestZoomLevel);
    var bidx = this.lat2tile(b,requestZoomLevel);

    //var result;
    var result = new Array();
    for (var x=lidx; x<=ridx; x++) {
      for (var y=tidx; y<=bidx; y++) {//in tiles tidx<=bidx
        var left = Math.round(this.tile2long(x,requestZoomLevel)*1000000)/1000000;
        var right = Math.round(this.tile2long(x+1,requestZoomLevel)*1000000)/1000000;
        var top = Math.round(this.tile2lat(y,requestZoomLevel)*1000000)/1000000;
        var bottom = Math.round(this.tile2lat(y+1,requestZoomLevel)*1000000)/1000000;
        //console.log(left+"\t"+bottom+"\t"+right+"\t"+top);
        //this.addBBox(left,bottom,right,top);
        //console.log("http://osm.org?bbox="+left+","+bottom+","+right+","+top);
        result.push( new L.LatLngBounds(new L.LatLng(bottom, left),new L.LatLng(top, right)));
      }
    }
    //console.log(result);
    return result;
  },

  addBBox: function (l,b,r,t) {
    var polygon = L.polygon([
      [t, l],
      [b, l],
      [b, r],
      [t, r]
    ]).addTo(this._map);
  },

  onMoveEnd: function () {
    if (this.options.debug) {
      console.debug("load Pois");
    }
    //console.log(this._map.getBounds());
    if (this._map.getZoom() >= this.options.minzoom) {
      //var bboxList = new Array(this._map.getBounds());
      var bboxList = this._view2BBoxes(
        this._map.getBounds()._southWest.lng,
        this._map.getBounds()._southWest.lat,
        this._map.getBounds()._northEast.lng,
        this._map.getBounds()._northEast.lat);

        // controls the after/before (Request) callbacks
        var finishedCount = 0;
        var queryCount = bboxList.length;
        var beforeRequest = true;

        for (var i = 0; i < bboxList.length; i++) {
          var bbox = bboxList[i];
          var x = bbox._southWest.lng;
          var y = bbox._northEast.lat;
          if ((x in this._requested) && (y in this._requested[x]) && (this._requested[x][y] == true)) {
            queryCount--;
            continue;
          }
          if (!(x in this._requested)) {
            this._requested[x] = {};
          }
          this._requested[x][y] = true;


          var queryWithMapCoordinates = this.options.query.replace(/(BBOX)/g, bbox.toOverpassBBoxString());
          var url =  this.options.endpoint + "interpreter?data=[out:json];" + queryWithMapCoordinates;

          if (beforeRequest) {
              this.options.beforeRequest.call(this);
              beforeRequest = false;
          }

          var self = this;
          var request = new XMLHttpRequest();
          request.open("GET", url, true);

          request.onload = function() {
            if (this.status >= 200 && this.status < 400) {
              var reference = {instance: self};
              self.options.callback.call(reference, JSON.parse(this.response));
              if (self.options.debug) {
                console.debug('queryCount: ' + queryCount + ' - finishedCount: ' + finishedCount);
              }
              if (++finishedCount == queryCount) {
                  self.options.afterRequest.call(self);
              }
            }
          };

          request.send();


        }
    }
  },

  onAdd: function (map) {
    this._map = map;
    if (map.zoomIndicator) {
      this._zoomControl = map.zoomIndicator;
      this._zoomControl._addLayer(this);
    }else{
      this._zoomControl = new L.Control.MinZoomIndicator(this.options.minZoomIndicatorOptions);
      map.addControl(this._zoomControl);
      this._zoomControl._addLayer(this);
    }

    this.onMoveEnd();
    if (this.options.query.indexOf("(BBOX)") != -1) {
      map.on('moveend', this.onMoveEnd, this);
    }
    if (this.options.debug) {
      console.debug("add layer");
    }
  },

  onRemove: function (map) {
    if (this.options.debug) {
      console.debug("remove layer");
    }
    L.LayerGroup.prototype.onRemove.call(this, map);
    this._ids = {};
    this._requested = {};
    this._zoomControl._removeLayer(this);

    map.off({
      'moveend': this.onMoveEnd
    }, this);

    this._map = null;
  },

  getData: function () {
    if (this.options.debug) {
      console.debug(this._data);
    }
    return this._data;
  }

});

//FIXME no idea why the browser crashes with this code
//L.OverPassLayer = function (options) {
//  return new L.OverPassLayer(options);
//};
