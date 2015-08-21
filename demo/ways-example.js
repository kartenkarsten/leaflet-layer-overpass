/*
  This javascript file demonstrates how to put markers over Ways returned from an Overpass query. 

  Author: Philip Shore (pshore2@gmail.com)
*/

function startmap(map_css_id) {

    var nearAldreth = [52.35624, 0.11827];

    var mapnikLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}) ;


    var overPassOverlay = TrackAccessOverPassLayer();

    // Start the map with this view.    
    var map = L.map(map_css_id, {
        center: nearAldreth,
        zoom: 16,
        layers: [ mapnikLayer, overPassOverlay ]
    });

    var baseLayers = { "Streets":mapnikLayer };
    var overlays   = { "Track Access":overPassOverlay };

    L.control.layers( baseLayers , overlays ).addTo(map);
}


/** Track Access Overlay */
function TrackAccessOverPassLayer() {

    //var endpoint = "http://overpass-api.de/api/";
    var endpoint = "http://overpass.osm.rambler.ru/cgi/";
    
    var options = {
      endpoint: endpoint,
      minzoom: 14,
      query: "(way[highway='track'](BBOX);>;);out;",
      callback: function(data) {

        // create an easy lookup for ways and nodes by id.
        var typeDict = { }; // Eg: typeDict['way']['1234']
        typeDict['node'] = {};
        typeDict['way'] = {};
        
        //console.log("Query returned "+data.elements.length+" elements.");
        
        for(i=0;i<data.elements.length;i++) {
          var e = data.elements[i];
          var type = e['type']; 
          
          if( type!=="way" && type!=="node" ) {
            continue; 
          }
        
          typeDict[ e['type'] ][ e['id'] ] = e ;
        }
        
        for(var wayId in typeDict['way'] ) {
          
          var way = typeDict['way'][wayId];
                    
          // build a list of latLng objects
          var latLngs = [];
          for( var n in way['nodes'] ) {
            var nodeId = way['nodes'][n];
            var node = typeDict['node'][nodeId];
            latLngs[latLngs.length] = L.latLng( node['lat'], node['lon'] );          
          }//n                  
            
          // draw
          var trackStyle = chooseTrackStyle( way['tags'] );
          if(trackStyle) {
            var line = L.polyline(latLngs, trackStyle );
            var popup = this.instance._poiInfo('way', way['tags'], wayId);
            line.bindPopup( popup );
            this.instance.addLayer(line);
          }
        }//w
        
      },
    };  

    
    var opl = new L.OverPassLayer( options );
    return opl;
}

/* 
 Return Leaflet style properties 
 @tags is a dictionary of OSM tags.
*/
function chooseTrackStyle(tags) {
  if(tags==null)
    console.log("empty tags in chooseTrackStyle");

  // hierarchy we will mark up:
  // undef  -> bicycle -> motorcyle -> motorcar
  // yellow -> green   -> blue      -> pink
  //   
  // adds dashes
  // permissive = small space dash.
  // undef access = 
  
  if(tags.access=="private") {
    return null;
  }

  try {  
      // add access tags based designation, overrides.
      if(tags.designation==="byway_open_to_all_traffic") {
        if(tags.motor_vehicle==null) { tags.motor_vehicle="yes"; }
        if(tags.bicycle==null) { tags.bicycle="yes"; }
        if(tags.foot==null) { tags.foot="yes"; }
      }  
      else if(tags.designation==="restricted_byway") {
        // rely on access tags otherwise defaults to yellow
        tags.access="permissive"; 
      }
      else if(tags.designation==="public_bridleway" || tags.designation==="permissive_bridleway" ) {
        if(tags.bicycle==null) { tags.bicycle="yes"; }
        if(tags.foot==null) { tags.foot="yes"; }
      }
      else if(tags.designation==="public_footpath" || tags.designation==="permissive_footpath" ) {
        if(tags.foot==null) { tags.foot="yes"; }
      }      

      // convert designated value to yes.
      for (var key in tags) {
        if (tags.hasOwnProperty(key) && tags[key]==='designated') {
            tags[key]='yes';
        }
      }      
      
      /* -- return style --*/
      var motorcarcol  ='#CC00CC';// pink
      var motorcyclecol='#3399FF';// blue
      var bicyclecol   ='#33CC33';// green
      var footcol      ='#FF8080';// red;
      var othercol     ='#FFFF00';// yellow
      var permissivedash='10,5';
      var otherdash     ='5,10';

      // These are the supported tags in our algorithm: 
      if (tags.designation!=null &&
          tags.designation!=='byway_open_to_all_traffic' && 
          tags.designation!=='restricted_byway' &&
          tags.designation!=='public_bridleway' &&
          tags.designation!=='public_footpath' &&
          tags.designation!=='permissive_footpath' &&
          tags.designation!=='permissive_bridleway')
      {
          // tag needs correcting?
          return { color: '#000000', dashArray:otherdash }
      }

      // try to mark up full-time non-permissive first.
      if(tags.motor_vehicle==="yes" || tags.motorcar==="yes") {
          return { color: motorcarcol } ;
      } else if ( tags.motorcycle==="yes") {
          return { color: motorcyclecol } ;
      } else if ( tags.bicycle==="yes" ) {
          return { color: bicyclecol } ;
      } else if ( tags.foot==="yes" ) {
          return { color: footcol } ;
      } else if(tags.motor_vehicle==="permissive" || tags.motorcar==="permissive") {
          return { color: motorcarcol, dashArray:permissivedash } ;  
      } else if ( tags.motorcycle==="permissive") {
          return { color: motorcyclecol, dashArray:permissivedash } ; 
      } else if ( tags.bicycle==="permissive" ) {
          return { color: bicyclecol, dashArray:permissivedash } ;
      } else if ( tags.foot==="permissive" ) {
          return { color: footcol, dashArray:permissivedash } ;          
      } else if ( tags.designation && tags.access==='permissive' ) {
          return { color: othercol, dashArray:permissivedash } ;
      } else if ( tags.designation ) {
          return { color: othercol } ;
      } else {
          return { color: othercol, dashArray:otherdash } ;
      }
   }
   catch(err) {
     return { color: '#000000' }
   }   
}

