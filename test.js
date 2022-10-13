reearth.ui.show(`
  <style>
    body {
      margin: 0;
    }
    #wrapper {
      background: #232226;
      height: 100%;
      color: white;
      border: 3px dotted red;
      border-radius: 5px;
      padding: 20px 0;
    }
  </style>

  <div id="wrapper">
    <p>Message arrival: <span id="msg"></span></p>
    <div id="lat">lat:</div>
    <div id="lng">lng:</div>
    <button id="download">Download</button>
  </div>

  <script>
  let layers;
  let marker_layers;
  let lat, lng;
  var czml;
  var dataSourcePromise;

    window.addEventListener("message", function (e) {
      if (e.source !== parent) return;
      // layers = e.data.layer;
      
      layers = e.source.reearth.layers.layers
      console.log(layers);

      marker_layers = layers.filter(o => o.type == "marker")
      console.log(marker_layers)

      lat = marker_layers[1].property.default.location.lat;
      lng = marker_layers[1].property.default.location.lng;
      console.log(lat, "lat", lng, "lng");

      document.getElementById("msg").textContent = layers.length;
      document.getElementById("lat").textContent = lat;
      document.getElementById("lng").textContent = lng;

      property = e.data.property;
      if (property.hasOwnProperty('default') && property.default.modelSize != null) {
        console.log("Size="+ property.default.modelSize);
      }
      if (property.hasOwnProperty('default') && property.default.modelUrl) {
        console.log("Model="+ property.default.modelUrl);
      }


      //implement czml 
      czml = [
        {
          id: "document",
          name: "CZML Model",
          version: "1.0",
        },
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

    // function download
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