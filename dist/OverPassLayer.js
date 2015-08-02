L.Control.MinZoomIndicator = L.Control.extend({

	options: {

		position: 'bottomleft',
	},

	_layers: {},

	initialize: function (options) {

		L.Util.setOptions(this, options);

		this._layers = {};
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

		var key,
		minZoomlevel =- 1;

		for(key in this._layers) {

			if ((this._layers[key] !== null) && (this._layers[key] > minZoomlevel)) {

				minZoomlevel = this._layers[key];
			}
		}

		return minZoomlevel;
	},

	onAdd: function (map) {

		this._map = map;

		map.zoomIndicator = this;

		var className = this.className,
		container = this._container = L.DomUtil.create('div', className);

		map.on('moveend', this._updateBox, this);

		this._updateBox(null);

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

		if (event !== null) {

			L.DomEvent.preventDefault(event);
		}

		var minzoomlevel = this._getMinZoomLevel();

		if (minzoomlevel == -1) {

			this._container.innerHTML = this.options.minZoomMessageNoLayer;

		} else {

			this._container.innerHTML = this.options.minZoomMessage
					.replace(/CURRENTZOOM/, this._map.getZoom())
					.replace(/MINZOOMLEVEL/, minzoomlevel);
		}

		if (this._map.getZoom() >= minzoomlevel) {

			this._container.style.display = 'none';
		} else {

			this._container.style.display = 'block';
		}
	},

	className : 'leaflet-control-minZoomIndicator'
});

L.LatLngBounds.prototype.toOverpassBBoxString = function (){

	var a = this._southWest,
	b = this._northEast;

	return [a.lat, a.lng, b.lat, b.lng].join(',');
};



L.OverPassLayer = L.FeatureGroup.extend({

	options: {

		'minZoom': 15,
		'requestPerTile': true,
		'endPoint': 'http://overpass-api.de/api/',
		'query': '(node({{bbox}})[organic];node({{bbox}})[second_hand];);out qt;',
		'timeout': 30 * 1000, // Milliseconds

		beforeRequest: function() {

		},

		afterRequest: function() {

		},

		onSuccess: function(data) {

			for(var i = 0; i < data.elements.length; i++) {

				var pos, popup, circle,
				e = data.elements[i];

				if (e.id in this.instance._ids) return;

				this.instance._ids[e.id] = true;

				if (e.type == 'node') {

					pos = new L.LatLng(e.lat, e.lon);
				} else {

					pos = new L.LatLng(e.center.lat, e.center.lon);
				}

				popup = this.instance._poiInfo(e.tags, e.id);
				circle = L.circle(pos, 50, {

					'color': 'green',
					'fillColor': '#3f0',
					'fillOpacity': 0.5,
				})
				.bindPopup(popup);

				this.instance.addLayer(circle);
			}
		},

		onError: function() {

		},

		onTimeout: function() {

		},

		minZoomIndicatorOptions: {

			'position': 'bottomleft',
			'minZoomMessageNoLayer': 'no layer assigned',
			'minZoomMessage': 'current Zoom-Level: CURRENTZOOM all data at Level: MINZOOMLEVEL',
		},
	},

	initialize: function (options) {

		L.Util.setOptions(this, options);

		this._layers = {};
		this._ids = {};
		this._requested = {};
	},

	_poiInfo: function(tags, id) {

		var row,
		link = document.createElement('a'),
		table = document.createElement('table'),
		div = document.createElement('div');

		link.href = 'http://www.openstreetmap.org/edit?editor=id&node=' + id;
		link.appendChild(document.createTextNode("Edit this entry in iD"));

		for (var key in tags){

			row = table.insertRow(0);
			row.insertCell(0).appendChild(document.createTextNode(key));
			row.insertCell(1).appendChild(document.createTextNode(tags[key]));
		}

		div.appendChild(link);
		div.appendChild(table);

		return div;
	},

	/**
	* splits the current view in uniform bboxes to allow caching
	*/
	long2tile: function (lon, zoom) {

		return ( Math.floor((lon + 180) / 360 * Math.pow(2, zoom)) );
	},

	lat2tile: function (lat, zoom)	{

		return ( Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI/180)) / Math.PI) / 2 * Math.pow(2, zoom)) );
	},

	tile2long: function (x, z) {

		return ( x / Math.pow(2, z) * 360 - 180 );
	},

	tile2lat: function (y, z) {

		var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);

		return ( 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))) );
	},

	_view2BBoxes: function(l, b, r, t) {

		var top, right, bottom, left,
		requestZoomLevel= 14,
		lidx = this.long2tile(l, requestZoomLevel),
		ridx = this.long2tile(r, requestZoomLevel),
		tidx = this.lat2tile(t, requestZoomLevel),
		bidx = this.lat2tile(b, requestZoomLevel),
		result = [];

		for (var x = lidx; x <= ridx; x++) {

			for (var y = tidx; y <= bidx; y++) {

				left = Math.round(this.tile2long(x, requestZoomLevel) * 1000000) / 1000000;
				right = Math.round(this.tile2long(x + 1, requestZoomLevel) * 1000000) / 1000000;
				top = Math.round(this.tile2lat(y, requestZoomLevel) * 1000000) / 1000000;
				bottom = Math.round(this.tile2lat(y + 1, requestZoomLevel) * 1000000) / 1000000;

				result.push(

					new L.LatLngBounds(new L.LatLng(bottom, left),
					new L.LatLng(top, right))
				);
			}
		}

		return result;
	},


	onMoveEnd: function () {

		if (this._map.getZoom() >= this.options.minZoom) {

			var x, y, bbox, bboxList, request, url, queryWithMapCoordinates,
			self = this,
			countdown = 0,
			beforeRequest = true,
			done = function () {

				if (--countdown === 0) {

					self.options.afterRequest.call(self);
				}
			};

			if (this.options.requestPerTile) {

				bboxList = this._view2BBoxes(
					this._map.getBounds()._southWest.lng,
					this._map.getBounds()._southWest.lat,
					this._map.getBounds()._northEast.lng,
					this._map.getBounds()._northEast.lat
				);
			} else {

				bboxList = new Array(this._map.getBounds());
			}

			countdown = bboxList.length;

			for (var i = 0; i < bboxList.length; i++) {

				bbox = bboxList[i];
				x = bbox._southWest.lng;
				y = bbox._northEast.lat;

				if ((x in this._requested) && (y in this._requested[x]) && (this._requested[x][y] === true)) {

					countdown--;
					continue;
				}

				if (!(x in this._requested)) {

					this._requested[x] = {};
				}

				this._requested[x][y] = true;

				queryWithMapCoordinates = this.options.query.replace(/(\{\{bbox\}\})/g, bbox.toOverpassBBoxString());
				url = this.options.endPoint + 'interpreter?data=[out:json];'+ queryWithMapCoordinates;

				if (beforeRequest) {

					var beforeRequestResult = this.options.beforeRequest.call(this);

					if ( beforeRequestResult === false ) {

						this.options.afterRequest.call(this);
						
						return;
					}

					beforeRequest = false;
				}

				this.sendRequest(url, done);
			}
		}
	},

	sendRequest: function(url, done) {

		var self = this,
		reference = { 'instance': this };

		request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.timeout = this.options.timeout;

		request.ontimeout = function () {

			self.options.onTimeout.call(reference, this);

			done();
		};

		request.onload = function () {

			if (this.status >= 200 && this.status < 400) {

				self.options.onSuccess.call(reference, JSON.parse(this.response));
			}
			else {

				self.options.onError.call(reference, this);
			}

			done();
		};

		request.send();
	},

	onAdd: function (map) {

		this._map = map;

		if (map.zoomIndicator) {

			this._zoomControl = map.zoomIndicator;
			this._zoomControl._addLayer(this);
		} else {

			this._zoomControl = new L.Control.MinZoomIndicator(this.options.minZoomIndicatorOptions);

			map.addControl(this._zoomControl);

			this._zoomControl._addLayer(this);
		}

		this.onMoveEnd();

		if (this.options.query.indexOf('({{bbox}})') !== -1) {

			map.on('moveend', this.onMoveEnd, this);
		}
	},

	onRemove: function (map) {

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

		return this._data;
	},
});
