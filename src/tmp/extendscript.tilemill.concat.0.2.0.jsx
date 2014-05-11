
/*! extendscript.tilemill.jsx - v0.2.0 - 2014-05-11 */
//
// extendscript.tilemill
// https://github.com/fabiantheblind/extendscript.tilemill
// a script for placing markers on tilemill export images
//
// Copyright (c)  2014
// Fabian "fabiantheblind" Morón Zirfas
// Permission is hereby granted, free of charge, to any
// person obtaining a copy of this software and associated
// documentation files (the "Software"), to deal in the Software
// without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to  permit persons to
// whom the Software is furnished to do so, subject to
// the following conditions:
// The above copyright notice and this permission notice
// shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF  CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTIO
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// see also http://www.opensource.org/licenses/mit-license.php

// this is globals.jsx

var DEBUG = true;
var settings = {

 new_layer: true,
  new_layer_name: 'marker',
  latitude_key:"",
  longitude_key:"",
  text_key:"",
  possible_lat_keys : ["latitude","Latitude","LATITUDE","lat", "Lat","LAT"],
  possible_lon_keys : ["longitude","Longitude","LONGITUDE","lon", "Lon","LON"],
  /**
   * orientation possibilites are:
   * DEFAULT
   * CENTER
   * TOP
   * BOTTOM
   * LEFT
   * RIGHT
   * UPPER_LEFT
   * LOWER_LEFT
   * UPPER_RIGHT
   * LOWER_RIGHT
   */
  default_marker_orientation: "CENTER",
  /*
  The script will set these infos below by itself. Don't change them.
  It reads data written by IDMap into the document.label
  mercator = 1
 // this script is only for tilemill. use mercator
  equirectangular = 0
  gallpeters = 2
  hammer = 3
  sinusoidal = 4
  aitoff = 5
   */
  projection_type:1,
  ptype:'mercator',
  doc:null,
  pw:0,
  ph:0,
  // check out http://dbsgeo.com/latlon/
  // to get lat lon coordinates
};

// this is the world bounding box
// will also be set by the script from the info of the doc
// settings.boundingBox = {
//   zoomed: true,
//   bounds: {
//     ul_lat:0,
//     ul_lon:0,
//     lr_lat:0,
//     lr_lon:0
//   }
// };

settings.bbox = {
  // top_lat:80,
  // bottom_lat:-80,
  // left_lon:-180,
  // right_lon:180,
  min:[],
  max:[]
};




// take a look at this indiscripts blog post about get_dim()
// I stay with the first version. because its easy and the other versions
// dont take in account that the marker could be outside of the page
// http://www.indiscripts.com/post/2009/10/work-around-the-width-height-gap
// TRACK 1 -- naive "getDims" function

// return the [width,height] of <obj>
// according to its (geometric|visible)Bounds
//
// // sample code
// var pItem = app.selection[0]; // get the selected object
// alert('Geometric Dims: ' + naive_getDims(pItem));
// alert('Visible Dims: ' + naive_getDims(pItem, true));
//

var get_dim = function( /*PageItem*/ obj, /*bool*/ visible) {
  var boundsProperty = ((visible) ? 'visible' : 'geometric') + 'Bounds';
  var b = obj[boundsProperty];
  // width=right-left , height = bottom-top
  return [b[3] - b[1], b[2] - b[0]];
};




var set_bbox = function(arr) {

  // var arr = str.split(",");
  // settings.bbox.left_lon = parseFloat(arr[0]);
  // settings.bbox.bottom_lat = parseFloat(arr[1]);
  // settings.bbox.right_lon = parseFloat(arr[2]);
  // settings.bbox.top_lat = parseFloat(arr[3]);

  settings.bbox.min[0] = parseFloat(arr[0]);
  settings.bbox.min[1] = parseFloat(arr[1]);
  settings.bbox.max[0] = parseFloat(arr[2]);
  settings.bbox.max[1] = parseFloat(arr[3]);

  // settings.boundingBox.bounds.ul_lat = settings.bbox.top_lat;
  // settings.boundingBox.bounds.ul_lon = settings.bbox.left_lon;
  // settings.boundingBox.bounds.lr_lat = settings.bbox.bottom_lat;
  // settings.boundingBox.bounds.lr_lon = settings.bbox.right_lon;
  if (DEBUG) {
    for (var key in settings.bbox) {
      if (settings.bbox.hasOwnProperty(key)) {
        $.writeln("Key: " + key + " Obj: " + settings.bbox[key]);
      }
    } // end of loop
  } // end DEBUG
  return 0;
};
/**
 * Load an image an get the size to create another doc that
 * has exactly the size of the image
 *
 *
 */
var setup_doc = function(){
  var image = File.openDialog("Select your image", "*.png", false);
  if (image === null) {
    return null;
  }
    var temp_doc = app.documents.add();
      temp_doc.viewPreferences.horizontalMeasurementUnits = temp_doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.PIXELS;
    var temp_rect = temp_doc.pages[0].rectangles.add({
      geometricBounds: [0, 0, 100, 100]
    });
    temp_rect.place(image);
    temp_rect.fit(FitOptions.FRAME_TO_CONTENT);
    var dim = get_dim(temp_rect, true);
    if(DEBUG) $.writeln( "new doc will be w/h " + dim);
    settings.pw = dim[0];
    settings.ph = dim[1];
    var doc = app.documents.add({
      documentPreferences: {
        pageWidth: dim[0] + "px",
        pageHeight: dim[1] + "px",
        facingPages: false
      },
      viewPreferences:{
        horizontalMeasurementUnits:MeasurementUnits.PIXELS,
        verticalMeasurementUnits:MeasurementUnits.PIXELS
      }
    });
    temp_doc.close(SaveOptions.NO);
    var page = doc.pages[0];
    var frame = page.rectangles.add({
      geometricBounds: [0, 0, dim[1], dim[0]]
    });
    frame.place(image);

return {"doc":doc,"frame":frame,"page":page};
};
// this is src/lib/importer.jsx

var importer = function (){
  var csvfile = File.openDialog("Select your csv file.","*.*",false);
  if(csvfile === null){
    // nothing selected or dialog aborted
    return null;
  }else{
    var geodata = CSV.toJSON(csvfile ,  useDialog = false, separator = ",");
    return geodata;
  }

};

// end of importer.jsx

// This is src/locations/marker.jsx

var selector = function(doc, page){
  var selection = doc.selection;
  var marker = null;
  if(selection.length < 1 ){
    $.writeln("no selection will fall back to basic marker");
    marker = get_marker(doc, page);
  }else{
    marker = selection[0];
  }
  return marker;
};


var set_transformation = function(doc, orientation) {
  // CENTER_ANCHOR
  // TOP_CENTER_ANCHOR
  doc.layoutWindows[0].transformReferencePoint = AnchorPoint.CENTER_ANCHOR;
};
var get_marker = function(doc, page) {
  get_or_create_objectstyles(doc);
  var marker = page.ovals.add({
    geometricBounds: [0, -10, 10, 0],
    fillColor: doc.swatches.item(4)
  });
  marker.appliedObjectStyle = doc.objectStyles.item("marker basic");
  return marker;
};


var offset_marker = function(orientation, pItem, x, y) {
  // orientaation possibilites are:
  // DEFAULT
  // CENTER
  // TOP
  // BOTTOM
  // LEFT
  // RIGHT
  // UPPER_LEFT
  // LOWER_LEFT
  // UPPER_RIGHT
  // LOWER_RIGHT

  var dim = naive_getDims(pItem, true);
  var mwidth = dim[0];
  var mheight = dim[1];

  if ((orientation).localeCompare('CENTER') === 0) {
    x = x - mwidth / 2;
    y = y - mheight / 2;
  } else if ((orientation).localeCompare('TOP') === 0) {
    x = x - mwidth / 2;
    // y = y - mheight / 2;
  } else if ((orientation).localeCompare('BOTTOM') === 0) {
    x = x - mwidth / 2;
    y = y - mheight;
  } else if ((orientation).localeCompare('LEFT') === 0) {
    // x = x - mwidth / 2;
    y = y - mheight / 2;
  } else if ((orientation).localeCompare('RIGHT') === 0) {
    x = x - mwidth;
    y = y - mheight / 2;
  } else if ((orientation).localeCompare('DEFAULT') === 0) {
    x = x - mwidth / 2;
    y = y - mheight / 2;
  }else if ((orientation).localeCompare('UPPER_LEFT') === 0) {
    x = x - mwidth;
    y = y - mheight;
  }else if ((orientation).localeCompare('LOWER_LEFT') === 0) {
    x = x -  mwidth;
    // y = y + mheight;
  }else if ((orientation).localeCompare('UPPER_RIGHT') === 0) {
    // x = x + mwidth/2;
    y = y - mheight;
  }else if ((orientation).localeCompare('LOWER_RIGHT') === 0) {
    // x = x + mwidth /2 ;
    // y = y;
  } else {
    // fall back to default
    x = x - mwidth / 2;
    y = y - mheight / 2;
  }

  return [x, y];
};

var place_markers = function(doc, page, marker, coordinates, settings) {
  var layer;
  var orientation = settings.default_marker_orientation;
  set_transformation(doc, null);
  if (settings.new_layer === true) {
    layer = doc.layers.item(settings.new_layer_name);
    try {
      var name = layer.name;
    } catch (e) {
      layer = doc.layers.add({
        name: settings.new_layer_name
      });
    }
  } else {
    layer = doc.activeLayer;
  }


  for (var i = 0; i < coordinates.length; i++) {
    var currentmarker = marker.duplicate();
    var xy = offset_marker(orientation, currentmarker,coordinates[i].xy.x,coordinates[i].xy.y);
    // xy[1] = settings.ph - xy[1];
    currentmarker.move(xy);
    currentmarker.label = coordinates[i].json;
    currentmarker.itemLayer = layer;
    if(DEBUG){
      var debug_tf = page.textFrames.add({geometricBounds:[0,0,20,100]});
      debug_tf.move(xy);
      debug_tf.contents = coordinates[i].json;
    }
  }
};

// take a look at this indiscripts blog post
// I stay with the first version. because its easy and the other versions
// dont take in account that the marker could be outside of the page
// http://www.indiscripts.com/post/2009/10/work-around-the-width-height-gap
// TRACK 1 -- naive "getDims" function

// return the [width,height] of <obj>
// according to its (geometric|visible)Bounds
//
// // sample code
// var pItem = app.selection[0]; // get the selected object
// alert('Geometric Dims: ' + naive_getDims(pItem));
// alert('Visible Dims: ' + naive_getDims(pItem, true));

function naive_getDims( /*PageItem*/ obj, /*bool*/ visible) {
  var boundsProperty = ((visible) ? 'visible' : 'geometric') + 'Bounds';
  var b = obj[boundsProperty];
  // width=right-left , height = bottom-top
  return [b[3] - b[1], b[2] - b[0]];
}

/**
 * This is src/locations/styling.jsx
 */

var get_or_create_objectstyles = function(doc) {

  var objectstyle = doc.objectStyles.item("marker basic");

  try {
    var name = objectstyle.name;
  } catch (e) {
    objectstyle = doc.objectStyles.add();

    objectstyle.properties = {
      name: "marker basic",
      fillColor: doc.swatches.item(4),
      /* could also be doc.swatches[3] */
      fillTint: 50,
      strokeColor: doc.swatches.item(5),
      strokeTint: 70,
      strokeWeight: 0.5,
      // bottomLeftCornerOption: CornerOptions.FANCY_CORNER,
      transparencySettings: {
        blendingSettings: {
          opacity: 50,
          blendMode: BlendMode.COLOR
        }
      }
    };
  }
  return objectstyle;
};



/**
 * End of styling.jsx
 */



 // End of marker.jsx

////////////////////////
//This is src/tilemill/geo.jsx
////////////////////////

var geojson_analyzer = function(settings, element) {
  var found_lat = false;
  var found_lon = false;
  var keys = {
    lon: null,
    lat: null
  };
  if (element.hasOwnProperty(settings.latitude_key)) {
    found_lat = true;
  }
  if (element.hasOwnProperty(settings.longitude_key)) {
    found_lon = true;
  }

  if (found_lat === true && found_lon === true) {
    keys.lon = settings.longitude_key;
    keys.lat = settings.latitude_key;
    return keys;
  }
  // if we are here we didn't match the right element
  // lets loop the possible keys
  for (var i = 0; i < settings.possible_lat_keys.length; i++) {
    for (var k in element) {
      if (element.hasOwnProperty(k)) {
        if ((settings.possible_lat_keys[i]).localeCompare(k) === 0) {
          keys.lat = k;
          found_lat = true;
          continue;
        }
      }
    }
    if (found_lat === true) {
      continue;
    }
  }
  for (var j = 0; j < settings.possible_lon_keys.length; j++) {
    for (var l in element) {
      if (element.hasOwnProperty(l)) {
        if ((settings.possible_lon_keys[j]).localeCompare(l) === 0) {
          keys.lon = l;
          found_lon = true;
          continue;
        }
      }
    }
    if (found_lon === true) {
      continue;
    }
  }
  if (found_lat === true && found_lon === true) {
    return keys;
  } else {
    alert("I could not find the right keys for your latitude and longitude fields\n" +
      "Please set them in the settings or call them:\n" +
      settings.possible_lat_keys + "\n\n" +
      settings.possible_lon_keys + "\n\n");
    return null;
  }
};
// var geodata_to_indesign_coords = function(settings, geodata, doc, page) {


//   var keys = geojson_analyzer(settings, geodata[0]);
//   if (keys === null) {
//     return 'no possible fields detected';
//   }

//   var transformer = Geo.projections.ind.transform;
//   var bounds = settings.boundingBox.bounds;
//   var ptype = settings.ptype;
//   var zoomed = settings.boundingBox.zoomed;

//   var coordinates = [];
//   if (DEBUG) $.writeln(geodata[0][keys.lat.constructor.name]);
//   for (var i = 0; i < geodata.length; i++) {

//     var xy = null;
//     var lat = geodata[i][keys.lat];
//     var lon = geodata[i][keys.lon];

//     var locations = [];
//     locations[0] = parseFloat(lon);
//     locations[1] = parseFloat(lat);
//     xy = transformer(doc, page, locations, zoomed, bounds, ptype);
//     coordinates.push({
//       "json": geodata[i].toSource(),
//       "xy": xy
//     });
//   }
//   return coordinates;
// };

function ToGeographic(mercatorX_lon, mercatorY_lat) {
  if (Math.abs(mercatorX_lon) < 180 && Math.abs(mercatorY_lat) < 90)
    return;

  if ((Math.abs(mercatorX_lon) > 20037508.3427892) || (Math.abs(mercatorY_lat) > 20037508.3427892))
    return;

  var x = mercatorX_lon;
  var y = mercatorY_lat;
  var num3 = x / 6378137.0;
  var num4 = num3 * 57.295779513082323;
  var num5 = Math.floor(((num4 + 180.0) / 360.0));
  var num6 = num4 - (num5 * 360.0);
  var num7 = 1.5707963267948966 - (2.0 * Math.atan(Math.exp((-1.0 * y) / 6378137.0)));
  mercatorX_lon = num6;
  mercatorY_lat = num7 * 57.295779513082323;

  return [mercatorX_lon, mercatorY_lat];
}

function ToWebMercator(mercatorX_lon, mercatorY_lat) {
  if ((Math.abs(mercatorX_lon) > 180 || Math.abs(mercatorY_lat) > 90))
    return;

  var num = mercatorX_lon * 0.017453292519943295;
  var x = 6378137.0 * num;
  var a = mercatorY_lat * 0.017453292519943295;

  mercatorX_lon = x;
  mercatorY_lat = 3189068.5 * Math.log((1.0 + Math.sin(a)) / (1.0 - Math.sin(a)));

  return [mercatorX_lon, mercatorY_lat];
}

var geo_to_page_coords = function (doc, page, marker, settings) {
  var min_lon = settings.bbox.min[0];
  var min_lat = settings.bbox.min[1];
  var max_lon = settings.bbox.max[0];
  var max_lat = settings.bbox.max[1];

      var tlngs = [min_lon, max_lon];
      var tlats = [min_lat, max_lat];

  // to web mercator takes lon first then lat
  // var min = ToWebMercator(-14.0625, 46.4379);
  // var max = ToWebMercator(7.9102, 62.4311);
      var lats, lngs = [];
      if(tlats[0]<tlats[1]){lats=tlats;}else{lats[0]=tlats[1];lats[1]=tlats[0];}
      if(tlngs[0]<tlngs[1]){lngs=tlngs;}else{lngs[0]=tlngs[1];lngs[1]=tlngs[0];}

      var max = ToWebMercator(lngs[1], lats[1]);
      var min = ToWebMercator(lngs[0], lats[0]);
      if(DEBUG) $.writeln("max:" +max);
      if(DEBUG) $.writeln("min:" +min);

  // var min = ToWebMercator(min_lon, min_lat);
  // var max = ToWebMercator(max_lon, max_lat);

  var o_min_x = min[0];
  var o_min_y = min[1];

  var o_max_x = max[0];
  var o_max_y = max[1];

  var width = settings.pw; //800;
  var height = settings.ph; //1018;

  var x_ratio = width / (o_max_x - o_min_x);
  var y_ratio = height / (o_max_y - o_min_y);

  var zero_y = height - y_ratio * min[1] * -1;
  var zero_x = x_ratio * min[0] * -1;
  if(DEBUG) $.writeln("zero_y: " + zero_y);
  if(DEBUG) $.writeln("zero_x: " + zero_x);

  // var temp_lat = 50.055977;
  // var temp_lng = -5.655096;
          //Coordinates you want to map
          // 40.41677540051771, -3.7037901976145804
  var coords = [{
        name: "Madrid lat 40.41677540051771, lon -3.7037901976145804",
      arr: [40.41677540051771, -3.7037901976145804]
    },{
        name: "Bogota lat 4.598055600146267, lon -74.07583329943009",
      arr: [4.598055600146267, -74.07583329943009]
    },{
        name: "lat -20, lon -20",
      arr: [-20, -20]
    },{
        name: "lat 20, lon 20",
      arr: [20, 20]
    },{
        name: "lat -20, lon 0",
      arr: [-20, 0]
    },{
        name: "lat 20, lon 0",
      arr: [20, 0]
    },{
      name: "lat 0, lon 0",
      arr: [0, 0]
    }
    // , {
    //   name: "Greenland",
    //   arr: [60.642647, -44.392888]
    // }, //Grönland
    // {
    //   name: "South South America",
    //   arr: [-55.259764, -67.083834]
    // }, //South South America
    // {
    //   name: "South Australia",
    //   arr: [-43.662537, 146.727964]
    // }, //South Australia
    // {
    //   name: "South India",
    //   arr: [7.823427, 76.934111]
    // } //South India
  ];


  // var coord = [temp_lat, temp_lng];

  var id_coordinates = [];
for(var c = 0; c < coords.length;c++){

  var lat = coords[c].arr[0];
  var lng = coords[c].arr[1];
  var xy = ToWebMercator(lng, lat);

  // var xy = ToWebMercator(lng, lat);

  $.writeln("xy " + xy);

    var centerX = xy[0]*x_ratio + zero_x;
    var centerY;
        if(lat === 0){
           centerY = xy[1]*y_ratio + zero_y;
        }else if(lat < 0){
           centerY = zero_y + Math.abs(xy[1]*y_ratio);
        }else if(lat > 0){
           centerY = zero_y - xy[1]*y_ratio;
        }

  // var centerX = (xy[0] - o_min_x) * x_ratio;
  // var centerY = (xy[1] - o_min_y) * y_ratio;
  if(DEBUG) $.writeln("centerX: " + centerX);
  if(DEBUG) $.writeln("centerY: " + centerY);

  var coord_res = {
    "json": "{'name':'"+coords[c].name+"'}",
    "xy": {
      "x": centerX,
      "y": centerY
    }
  };
  id_coordinates.push(coord_res);
}
  place_markers(doc, page, marker, id_coordinates, settings);

};

////////////////////////
// End of geo.jsx
////////////////////////
var draw = function() {

  var setup_result = setup_doc();

  if (setup_result === null) return; // aborted by user

  var doc = setup_result.doc;

  var current_unit = doc.viewPreferences.horizontalMeasurementUnits;

  doc.viewPreferences.horizontalMeasurementUnits = doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.PIXELS;

  ///////////////////////////////

  var frame = setup_result.frame;
  var page = setup_result.page;
  // build the UI for interaction


  alert("Paste the values you used in tilemill to create your bounding box.\ne.g. -120,-45,120,45 is ordered like this [min lon, min lat, max lon, max lat]");
  var dialog = app.dialogs.add({
    name: "Paste Mapbox Bounds",
    canCancel: true,

  });

  var d_col_one = dialog.dialogColumns.add();
  var d_col_two = dialog.dialogColumns.add();
  var d_col_three = dialog.dialogColumns.add();
  var d_col_four = dialog.dialogColumns.add();

  var min_lon_row = d_col_one.dialogRows.add();
  var label_min_lon = min_lon_row.staticTexts.add({
    staticLabel: "min lon:",
    minWidth: 70,
  });
  var min_lon_box = min_lon_row.realEditboxes.add({
    editValue:-120,
    minimumValue: -180,
    maximumValue: 180,
    smallNudge:0.1,
    largeNudge:1
    });

  var min_lat_row = d_col_one.dialogRows.add();
  var label_min_lat = min_lat_row.staticTexts.add({
    staticLabel: "min lat:",
    minWidth: 70,
  });
  var min_lat_box = min_lat_row.realEditboxes.add({
    editValue:-45,
    minimumValue: -90,
    maximumValue: 90,
    smallNudge:0.1,
    largeNudge:1
    });

  var max_lon_row = d_col_one.dialogRows.add();
  var label_max_lon = max_lon_row.staticTexts.add({
    staticLabel: "max lon:",
    minWidth: 70,
  });
  var max_lon_box = max_lon_row.realEditboxes.add({
    editValue:120,
    minimumValue: -180,
    maximumValue: 180,
    smallNudge:0.1,
    largeNudge:1
    });

  var max_lat_row = d_col_one.dialogRows.add();
  var label_max_lat = max_lat_row.staticTexts.add({
    staticLabel: "max lat:",
    minWidth: 70,
  });
  var max_lat_box = max_lat_row.realEditboxes.add({
    editValue:45,
    minimumValue: -90,
    maximumValue: 90,
    smallNudge:0.1,
    largeNudge:1
    });

  if (dialog.show() === true) {
    var min_lon = min_lon_box.editValue;
    var min_lat = min_lat_box.editValue;
    var max_lon = max_lon_box.editValue;
    var max_lat = max_lat_box.editValue;
    dialog.destroy();

    if (set_bbox([min_lon, min_lat, max_lon, max_lat]) !== 0) {
      alert("error reading in the bbox values");
      return;
    }


    var marker = selector(doc, page);
    geo_to_page_coords(doc, page, marker, settings);


  }

};


draw();


////////////////////////
///END OF MAIN.JSX
////////////////////////