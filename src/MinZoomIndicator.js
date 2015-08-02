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
