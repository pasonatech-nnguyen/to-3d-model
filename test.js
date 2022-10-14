reearth.ui.show(`
  <style>
    body {
      margin: 0;
    }
    #wrapper {
      background: #232226;
      height: 100%;
      color: white;
      width: 312px;
      border-radius: 5px;
      padding: 20px 0;
    }
  </style>

  <div id="wrapper">
    
    - Generate Setting -
    <br><br>
    <label>Heading :</label>
    <input type="text" id="model-heading"><br><br>
    <label>Pitch  :</label>
    <input type="text" id="model-pitch"><br><br>
    <label>Roll  :</label>
    <input type="text" id="model-roll"><br><br>
    <label>Size:</label>
    <input type="text" id="model-size"><br><br>

    
    <button id="generate-mode">Generate Models</button>
    <br><br>
    <button id="download">Export CZML</button>
  </div>

  <script>
  let layers;
  let marker_layers;
  let lat, lng;
  var dataSourcePromise;


  let marker_lat, marker_lng, marker_id, maker_czml;

  let czml = [{
      id: "document",
      name: "CZML Model",
      version: "1.0",
    }];

    window.addEventListener("message", function (e) {
      if (e.source !== parent) return;
      // layers = e.data.layer;
      
      layers = e.source.reearth.layers.layers
      console.log(layers);

      //get maker
      marker_layers = layers.filter(o => o.type == "marker")
      console.log(marker_layers)

      //lat = marker_layers[1].property.default.location.lat;
      //lng = marker_layers[1].property.default.location.lng;

      let modelUrl = property.default.modelUrl;

      //get multiples marker location data
      for (var i = 0; i < marker_layers.length; i++) {
        console.log(marker_layers[i].property.default.location.lat);
        marker_lat = marker_layers[i].property.default.location.lat;
        marker_lng = marker_layers[i].property.default.location.lng;
        marker_id = marker_layers[i].property.default.location.id;


        czml.push(
          {
            id: marker_id,
            name: "3D model",
            position: {
              cartographicDegrees: [marker_lat, marker_lng, 10000],
            },
            model: {
              gltf: modelUrl,
              scale: 1,
              minimumPixelSize: 128,
            },
          }
        );

        console.log(czml);
      }
      console.log(czml);

      // document.getElementById("msg").textContent = layers.length;
      // document.getElementById("lat").textContent = lat;
      // document.getElementById("lng").textContent = lng;

      property = e.data.property;
      if (property.hasOwnProperty('default') && property.default.modelSize != null) {
        console.log("Size="+ property.default.modelSize);
      }
      if (property.hasOwnProperty('default') && property.default.modelUrl) {
        console.log("Model="+ property.default.modelUrl);
      }

      //make circle json
      var center = [lng, lat];
      var radius = 5;
      var options = {steps: 10, units: 'kilometers', properties: {foo: 'bar'}};
      var circle_json = turf.circle(center, radius, options);

      console.log(circle_json);


      //implement czml 
      temp_czml = [
        {
          id: "aircraft model",
          name: "Cesium Air",
          position: {
            cartographicDegrees: [lat, lng, 10000],
          },
          model: {
            gltf: property.default.modelUrl,
            scale: property.default.modelSize,
            minimumPixelSize: 128,
          },
        },
      ];
      
      console.log(czml[1])
       
    });

    // Download CZML
    function downloadObjectAsJson(exportObj, exportName){
      var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
      var downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href",     dataStr);
      downloadAnchorNode.setAttribute("download", exportName + ".czml");
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }

    document.getElementById("download").addEventListener("click", (e) => {
      console.log("click success")
      downloadObjectAsJson(czml, "czml")
    }); 

    // Download GeoJSON
    // function downloadGeojson(exportObj, exportName){
    //   var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    //   var temp = document.createElement('a');
    //   temp.setAttribute("href",     dataStr);
    //   temp.setAttribute("download", exportName + ".geojson");
    //   document.body.appendChild(temp); // required for firefox
    //   temp.click();
    //   temp.remove();
    // }

    // document.getElementById("download-geojson").addEventListener("click", (e) => {
    //   console.log("Click download geojson btn")
    //   downloadGeojson(circle_json, "geojson")
    // }); 

  </script>
  `);

reearth.on("update", send);
send();

function send() {
  reearth.ui.postMessage({
    layers: reearth.layers.layers,
    property: reearth.widget.property
  })
}