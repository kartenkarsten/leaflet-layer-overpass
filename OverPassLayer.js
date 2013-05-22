L.LatLngBounds.prototype.toOverpassBBoxString = function (){
  var a = this._southWest,
      b = this._northEast;
  return [a.lat, a.lng, b.lat, b.lng].join(",");
}

L.OverPassLayer = L.FeatureGroup.extend({
  options: {
    query: "http://overpass-api.de/api/interpreter?data=[out:json];(node(BBOX)[organic];node(BBOX)[second_hand];);out qt;",
    callback: function(data) {
      for(i=0;i<data.elements.length;i++) {
        e = data.elements[i];

        if (e.id in this.instance._ids) return;
        this.instance._ids[e.id] = true;
        var pos = new L.LatLng(e.lat, e.lon);
        var popup = this.instance._poiInfo(e.tags);
        var circle = L.circle(pos, 50, {
            color: 'green',
            fillColor: '#3f0',
            fillOpacity: 0.5
        })
          .bindPopup(popup)
          .addTo(this.instance._map);
      }
    }
  },

  initialize: function (options) {
    L.Util.setOptions(this, options);
    this._layers = {};
    // save position of the layer or any options from the constructor
    console.log("init");
    this._ids = {};
    this._map = options._map;//to set _map immediately
    this.onMoveEnd();
    if (this.options.query.indexOf("(BBOX)") != -1) {
      this._map.on('moveend', this.onMoveEnd, this);
    }
  },

  _poiInfo: function(tags) {
    var r = $('<table>');
    for (key in tags)
      r.append($('<tr>').append($('<th>').text(key)).append($('<td>').text(tags[key])));
    return $('<div>').append(r).html();
  },

  onMoveEnd: function () {
    console.log("load Pois");

    $.ajax({
      url: this.options.query.replace(/(BBOX)/g, this._map.getBounds().toOverpassBBoxString()),
      context: { instance: this },
      crossDomain: true,
      dataType: "json",
      data: {},
      success: this.options.callback
    });
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
