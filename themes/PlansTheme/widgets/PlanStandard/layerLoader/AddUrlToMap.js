///////////////////////////////////////////////////////////////////////////
// Copyright © Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////
define([
  "dojo/_base/declare",
  "dojo/_base/array",
  "dojo/Deferred",
  "dojo/promise/all",
  "./LayerLoader",
  "./util",
  "esri/layers/ArcGISDynamicMapServiceLayer",
  "esri/layers/ArcGISImageServiceLayer",
  "esri/layers/ArcGISTiledMapServiceLayer",
  "esri/layers/CSVLayer",
  "esri/layers/FeatureLayer",
  "esri/layers/GeoRSSLayer",
  "esri/layers/ImageParameters",
  "esri/layers/KMLLayer",
  "esri/layers/StreamLayer",
  "esri/layers/VectorTileLayer",
  "esri/layers/WMSLayer",
  "esri/layers/WMTSLayer",
  "esri/InfoTemplate",
  "dijit/form/Select",
], function (
  declare,
  array,
  Deferred,
  all,
  LayerLoader,
  util,
  ArcGISDynamicMapServiceLayer,
  ArcGISImageServiceLayer,
  ArcGISTiledMapServiceLayer,
  CSVLayer,
  FeatureLayer,
  GeoRSSLayer,
  ImageParameters,
  KMLLayer,
  StreamLayer,
  VectorTileLayer,
  WMSLayer,
  WMTSLayer,
  InfoTemplate
) {
  return declare(null, {
    _dfd: null,
    map: null,
    addService: function (url, type) {
      if (url.length > 0) {
        if (url.indexOf("http://") === 0 || url.indexOf("https://") === 0) {
          ok = true;
        }
      }
      if (!ok) {
        return;
      }
      var dfd = new Deferred();
      var map = this.map;
      this._handleAdd(dfd, map, type, url);
      dfd
        .then(function (result) {})
        .otherwise(function (error) {
          console.warn("Add layer failed.");
          console.warn(error);
        });
    },
    _handleAdd: function (dfd, map, type, url) {
      url = util.checkMixedContent(url);
      var lc = url.toLowerCase();
      var loader = new LayerLoader();
      var id = loader._generateLayerId();
      var self = this,
        layer = null;

      if (type === "ArcGIS") {
        if (lc.indexOf("/featureserver") > 0 || lc.indexOf("/mapserver") > 0) {
          loader
            ._readRestInfo(url)
            .then(function (info) {
              if (
                info &&
                typeof info.type === "string" &&
                (info.type === "Feature Layer" || info.type === "Table")
              ) {
                layer = new FeatureLayer(url, {
                  id: id,
                  outFields: ["*"],
                  infoTemplate: new InfoTemplate(),
                });
                self._waitThenAdd(dfd, map, type, loader, layer);
              } else {
                if (lc.indexOf("/featureserver") > 0) {
                  var dfds = [];
                  array.forEach(info.layers, function (li) {
                    var lyr = new FeatureLayer(url + "/" + li.id, {
                      id: loader._generateLayerId(),
                      outFields: ["*"],
                      infoTemplate: new InfoTemplate(),
                    });
                    dfds.push(loader._waitForLayer(lyr));
                  });
                  array.forEach(info.tables, function (li) {
                    var tbl = new FeatureLayer(url + "/" + li.id, {
                      id: loader._generateLayerId(),
                      outFields: ["*"],
                    });
                    dfds.push(loader._waitForLayer(tbl));
                  });
                  all(dfds)
                    .then(function (results) {
                      var lyrs = [];
                      array.forEach(results, function (lyr) {
                        lyrs.push(lyr);
                      });
                      lyrs.reverse();
                      array.forEach(lyrs, function (lyr) {
                        loader._setFeatureLayerInfoTemplate(lyr);
                        lyr.xtnAddData = true;
                        map.addLayer(lyr);
                      });
                      dfd.resolve(lyrs);
                    })
                    .otherwise(function (error) {
                      dfd.reject(error);
                    });
                } else if (lc.indexOf("/mapserver") > 0) {
                  if (info.tileInfo) {
                    layer = new ArcGISTiledMapServiceLayer(url, {
                      id: id,
                    });
                  } else {
                    var mslOptions = { id: id };
                    if (
                      info &&
                      info.supportedImageFormatTypes &&
                      info.supportedImageFormatTypes.indexOf("PNG32") !== -1
                    ) {
                      mslOptions.imageParameters = new ImageParameters();
                      mslOptions.imageParameters.format = "png32";
                    }
                    layer = new ArcGISDynamicMapServiceLayer(url, mslOptions);
                  }
                  self._waitThenAdd(dfd, map, type, loader, layer);
                }
              }
            })
            .otherwise(function (error) {
              dfd.reject(error);
            });
        } else if (lc.indexOf("/imageserver") > 0) {
          layer = new ArcGISImageServiceLayer(url, {
            id: id,
          });
          this._waitThenAdd(dfd, map, type, loader, layer);
        } else if (
          lc.indexOf("/vectortileserver") > 0 ||
          lc.indexOf("/resources/styles/root.json") > 0
        ) {
          if (!VectorTileLayer || !VectorTileLayer.supported()) {
            dfd.reject("Unsupported");
          } else {
            loader
              ._checkVectorTileUrl(url, {})
              .then(function (vturl) {
                //console.warn("vectorTileUrl",vturl);
                layer = new VectorTileLayer(vturl, {
                  id: id,
                });
                self._waitThenAdd(dfd, map, type, loader, layer);
              })
              .otherwise(function (error) {
                dfd.reject(error);
              });
          }
        } else if (lc.indexOf("/streamserver") > 0) {
          layer = new StreamLayer(url, {
            id: id,
            purgeOptions: {
              displayCount: 10000,
            },
            infoTemplate: new InfoTemplate(),
          });
          this._waitThenAdd(dfd, map, type, loader, layer);
        } else {
          dfd.reject("Unsupported");
        }
      } else if (type === "WMS") {
        layer = new WMSLayer(url, {
          id: id,
        });
        this._waitThenAdd(dfd, map, type, loader, layer);
      } else if (type === "WMTS") {
        layer = new WMTSLayer(url, {
          id: id,
        });
      } else if (type === "WFS") {
        util.loadWFSByUrl(dfd, map, loader, url, id, true);
      } else if (type === "KML") {
        layer = new KMLLayer(url, {
          id: id,
        });
        this._waitThenAdd(dfd, map, type, loader, layer);
      } else if (type === "GeoRSS") {
        layer = new GeoRSSLayer(url, {
          id: id,
        });
        this._waitThenAdd(dfd, map, type, loader, layer);
      } else if (type === "CSV") {
        layer = new CSVLayer(url, {
          id: id,
        });
        layer.setInfoTemplate(loader._newInfoTemplate());
        this._waitThenAdd(dfd, map, type, loader, layer);
      }
    },
    _waitThenAdd: function (dfd, map, type, loader, layer) {
      loader
        ._waitForLayer(layer)
        .then(function (lyr) {
          if (type === "WMS") {
            loader._setWMSVisibleLayers(lyr);
          } else if (
            lyr &&
            lyr.declaredClass === "esri.layers.ArcGISDynamicMapServiceLayer"
          ) {
            loader._setDynamicLayerInfoTemplates(lyr);
          } else if (lyr && lyr.declaredClass === "esri.layers.FeatureLayer") {
            loader._setFeatureLayerInfoTemplate(lyr);
          } else if (lyr && lyr.declaredClass === "esri.layers.CSVLayer") {
            loader._setFeatureLayerInfoTemplate(lyr);
          }
          lyr.xtnAddData = true;
          if (type === "KML") {
            var mapSR = map.spatialReference,
              outSR = lyr._outSR;
            var projOk =
              mapSR &&
              outSR &&
              (mapSR.equals(outSR) ||
                (mapSR.isWebMercator() && outSR.wkid === 4326) ||
                (outSR.isWebMercator() && mapSR.wkid === 4326));
            if (projOk) {
              map.addLayer(lyr);
            }
          } else {
            map.addLayer(lyr);
          }
          dfd.resolve(lyr);
        })
        .otherwise(function (error) {
          dfd.reject(error);
        });
    },
  });
});
