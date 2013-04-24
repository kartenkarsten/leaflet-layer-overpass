L.Control.InbazLegende = L.Control.extend({
	options: {
		collapsed: true,
		position: 'bottomleft',
		tooltip: 'Show info',
		callback: function (results) {
      text = "";
      for (i=0; i<results.length;i++) {
        text += '<div><img src="icons/conTag_'+results[i].id+'.png"/>'+
                '<b>'+results[i].name+'</b><br>'+results[i].desc+'</div>';
      }
      this._element.innerHTML = text;
		}
	},

	_callbackId: 0,

	initialize: function (options) {
		L.Util.setOptions(this, options);
	},

	onAdd: function (map) {
		this._map = map;
		var className = 'leaflet-control-legende',
			container = this._container = L.DomUtil.create('div', className);

		L.DomEvent.disableClickPropagation(container);

		var display = this._element = L.DomUtil.create('div', className + '-div');
    display.innerHTML="Content is loading...";
    L.DomEvent.addListener(display, 'click', this._toggle, this);

    var link = this._link = document.createElement('a');
    link.href = '#';
    link.title = this.options.tooltip;

    L.DomEvent.addListener(link, 'click', this._toggle, this);

		if (this.options.collapsed) {
      display.style.display = 'none';
		}else {
      link.style.display = 'none';
    }

		container.appendChild(display);
		container.appendChild(link);

    this._getTags();

		return container;
	},

	_getTags : function () {
		this._callbackId = "_l_inbazlegende_" + (this._callbackId++);
		window[this._callbackId] = L.Util.bind(this.options.callback, this);

		var params = {
			callback : this._callbackId,
      getTags: 'yes'
		};
		url = "http://bastler.bplaced.net/api/inbaz_api.php" + L.Util.getParamString(params);
		script = document.createElement("script");

		script.type = "text/javascript";
		script.src = url;
		script.id = this._callbackId;
		document.getElementsByTagName("head")[0].appendChild(script);
	},

  _toggle: function (event) {
		L.DomEvent.preventDefault(event);
    //toggle info display
		if (this.options.collapsed) {
      this._element.style.display = 'block';
      this._link.style.display = 'none';
      this.options.collapsed = false;
    }else {
      this._element.style.display = 'none';
      this._link.style.display = 'block';
      this.options.collapsed = true;
    }

  }

});
