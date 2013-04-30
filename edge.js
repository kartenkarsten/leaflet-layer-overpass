//http://leafletjs.com/reference.html#ilayer
L.EdgeLayer = L.Class.extend({
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
    }
  },

  initialize: function (options) {
    L.Util.setOptions(this, options);
    this._loadPoi();
  }, 

  ids: {},

//    function handleTrivia(eventID) {
//      var poiInfo = function(tags) {
//        var r = $('<table>');
//        for (key in tags)
//          r.append($('<tr>').append($('<th>').text(key)).append($('<td>').text(tags[key])));
//        return $('<div>').append(r).html();
//      }
//
//      var content = false;
//      $.getJSON(apiUrl, {Data : "trivia", EventID : eventID } , function(data) {
//
//        console.log(data);
//        console.log(eventID);
//
//        //convert Conventions to a POI overlay
//        for (i=0;i<data.length;i++) {
//          content=true;
//
//          var trivia = data[i];
//
//          if (trivia.Stat == "conType") {
//            console.log("ev: "+eventID+"("+ids[eventID].ShortTitle+") ist eine "+trivia.Value + " Convention");
//            var pos = new L.LatLng(ids[eventID].Lat, ids[eventID].Lng);
//            var icon;
//            if (trivia.Value in icons) {
//              console.log("icon exsists ("+trivia.Value+")");
//              icon = icons[trivia.Value];
//              }else{
//              //TODO unkown icon
//              icon = juggling;
//            }
//            var popup = poiInfo(ids[eventID]);
//            var marker = new L.Marker(pos, {icon: icon}).bindPopup(popup);
//            map.addLayer(marker);
//          }
//        }
//
//      });
//      //TODO delete maybe
//      if (!content) {//add default marker
//          var pos = new L.LatLng(ids[eventID].Lat, ids[eventID].Lng);
//          var icon = icons["juggling"];
//          var popup = poiInfo(ids[eventID]);
//          var marker = new L.Marker(pos, {icon: icon}).bindPopup(popup);
//          map.addLayer(marker);
//        }
//    }

    _loadPoi: function () {
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
            map.addLayer(marker);
          }

//          console.log("get Con Types");
//          for(eventID in ids) {
//            console.log("Trivia for Event ["+eventID+"]"+ids[eventID].ShortTitle);
//            handleTrivia(eventID);
//          }
        });

    },
    CLASS_NAME: "EdgeLayer"

});

