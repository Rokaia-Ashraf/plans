define([
  "dojo/_base/declare",
  "jimu/BaseWidget",
  "esri/geometry/Polygon",
  "esri/symbols/SimpleFillSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/graphic",
  "esri/Color",
  "./layerLoader/AddUrlToMap",
], function (
  declare,
  BaseWidget,
  Polygon,
  SimpleFillSymbol,
  SimpleLineSymbol,
  Graphic,
  Color,
  AddUrlToMap
) {
  return declare([BaseWidget], {
    baseClass: "jimu-widget-dbheader",
    postCreate: function () {
      this.inherited(arguments);
    },
    regions: [],
    govs: [],
    domains: [],
    markazes: [],
    sheakhas: [],
    plans: [],
    spatialReference: {},
    startup: function () {
      this.urlParams = new URLSearchParams(window.location.search);
      map = this.map;
      this.inherited(arguments);
      this.loadRegions();
      this.loadDomains();
      var self = this;
      $("#regions").change(function () {
        var val = $(this).val();
        self.clearGov();
        self.loadGovs(val);
        self.renderRegion(val);
      });

      $("#govs").change(function () {
        var val = $(this).val();
        self.clearMarkaz();
        self.loadMarkazes(val);
        self.renderGov(val);
      });

      $("#markazes").change(function () {
        var val = $(this).val();
        self.clearSheakha();
        self.loadSheakha(val);
        self.renderMarkaz(val);
      });

      $("#sheakhas,#cities").change(function () {
        var val = $(this).val();
        self.renderSheakha(val);
      });
      this.loadData();
    },
    clearGov: function () {
      var self = this;
      $("#govs option").remove();
      $("#govs").append('<option value="">الكل</option>');
      self.clearMarkaz();
    },
    clearMarkaz: function () {
      var self = this;
      $("#markazes option").remove();
      $("#markazes").append('<option value="">الكل</option>');
      self.clearSheakha();
    },
    clearSheakha: function () {
      $("#sheakhas option,#cities option").remove();
      $("#sheakhas,#cities").append('<option value="">الكل</option>');
    },
    loadRegions: function () {
      $("#regions option").remove();
      $("#regions").append('<option value="">الكل</option>');
      var url = this.appConfig?.filterConfig?.regionlayer?.url;
      if (url) {
        this.regions = [];
        var self = this;
        $.get(url, function (data) {
          var features = JSON.parse(data);
          self.spatialReference["region"] = features.spatialReference;
          features.features.forEach((element) => {
            self.regions.push(element);
            $("#regions").append(
              '<option value="' +
                element.attributes.Region_GCode +
                '">' +
                element.attributes.Region_Name +
                "</option>"
            );
          });
        });
      }
    },
    loadGovs: function (val) {
      this.govs = [];
      var self = this;
      var url = self.appConfig?.filterConfig?.govLayer?.url;
      if (url) {
        url += val ? "&where=Region_GCode='" + val + "'" : "&where=1=1";
        $.get(url, function (data) {
          var features = JSON.parse(data);
          self.spatialReference["gov"] = features.spatialReference;
          features.features.forEach((element) => {
            var index = self.domains.findIndex((x) => {
              return x.code == element.attributes.Gov_Name;
            });
            if (index >= 0) {
              element.name = self.domains[index].name;
              $("#govs").append(
                '<option value="' +
                  element.attributes.Gov_GCode +
                  '">' +
                  element.name +
                  "</option>"
              );
            }
            self.govs.push(element);
          });
        });
      }
    },
    loadMarkazes: function (val) {
      this.markazes = [];
      var self = this;
      var url = self.appConfig?.filterConfig?.markazLayer?.url;
      if (url) {
        url += val ? "&where=Gov_GCode='" + val + "'" : "&where=1=1";
        $.get(url, function (data) {
          var features = JSON.parse(data);
          self.spatialReference["markaz"] = features.spatialReference;
          features.features.forEach((element) => {
            $("#markazes").append(
              '<option value="' +
                element.attributes.Markaz_GCode +
                '">' +
                element.attributes.Markaz_Name +
                "</option>"
            );
            self.markazes.push(element);
          });
        });
      }
    },
    loadSheakha: function (val) {
      this.sheakhas = [];
      var self = this;
      var url = self.appConfig?.filterConfig?.sheakhaLayer?.url; /////
      if (url) {
        url += val ? "&where=Markaz_GCode='" + val + "'" : "&where=1=2";
        $.get(url, function (data) {
          var features = JSON.parse(data);
          self.spatialReference["sheakha"] = features.spatialReference;
          features.features.forEach((element) => {
            if ([1, 2, 3, 4, 10].indexOf(element.attributes.Set_Type) >= 0) {
              $("#cities").append(
                '<option value="' +
                  element.attributes.Shiakha_GCode +
                  '">' +
                  element.attributes.Shiakha_Name +
                  "</option>"
              );
              self.sheakhas.push(element);
            } else {
              $("#sheakhas").append(
                '<option value="' +
                  element.attributes.Shiakha_GCode +
                  '">' +
                  element.attributes.Shiakha_Name +
                  "</option>"
              );
              self.sheakhas.push(element);
            }
          });
        });
      }
    },
    loadDomains() {
      this.domains = [];
      var self = this;
      var domainQuery = this.appConfig?.filterConfig?.govLayer?.domainQuery;
      if (domainQuery) {
        $.get(domainQuery, function (data) {
          var domains = JSON.parse(data);
          domains.domains[0].codedValues.forEach((element) => {
            self.domains.push(element);
          });
        });
      }
    },
    renderRegion: function (val) {
      var self = this;
      this.map.graphics.clear();
      if (val) {
        var index = self.regions.findIndex((r) => {
          return r.attributes.Region_GCode == val;
        });
        if (index >= 0) {
          self.zoomAndHighLight(
            self.regions[index].geometry,
            self.spatialReference["region"]
          );
        }
      }
    },
    renderGov: function (val) {
      var self = this;
      this.map.graphics.clear();
      if (val) {
        var index = self.govs.findIndex((r) => {
          return r.attributes.Gov_GCode == val;
        });
        if (index >= 0) {
          self.zoomAndHighLight(
            self.govs[index].geometry,
            self.spatialReference["gov"]
          );
        }
      }
    },
    renderMarkaz: function (val) {
      var self = this;
      this.map.graphics.clear();
      if (val) {
        var index = self.markazes.findIndex((r) => {
          return r.attributes.Markaz_GCode == val;
        });
        if (index >= 0) {
          self.zoomAndHighLight(
            self.markazes[index].geometry,
            self.spatialReference["markaz"]
          );
        }
      }
    },
    renderSheakha: function (val) {
      var self = this;
      this.map.graphics.clear();
      if (val) {
        var index = self.sheakhas.findIndex((r) => {
          return r.attributes.Shiakha_GCode == val;
        });
        if (index >= 0) {
          debugger;
          self.zoomAndHighLight(
            self.sheakhas[index].geometry,
            self.spatialReference["sheakha"]
          );
        }
      }
    },
    zoomAndHighLight: function (geometry, spatialreference) {
      this.map.graphics.clear();
      var highlightSymbol = new SimpleFillSymbol(
        SimpleFillSymbol.STYLE_SOLID,
        new SimpleLineSymbol(
          SimpleLineSymbol.STYLE_SOLID,
          new Color([255, 255, 255]),
          3
        ),
        new Color([125, 125, 125, 0])
      );
      spatialreference = spatialreference || {
        wkid: 102100,
        latestWkid: 3857,
      };
      var polygon = new Polygon({
        rings: geometry.rings,
        spatialReference: spatialreference,
      });
      var highlightGraphic = new Graphic(polygon, highlightSymbol);
      // this.map.graphics.add(highlightGraphic);
      this.map.setExtent(polygon.getExtent());
    },
    loadData() {
      map = this.map;
      var lang = "en";
      var plansUrl = this.appConfig.apiURL + "Plans/AllPlans";
      var url = this.appConfig.apiURL + "Plans/Plan";
      var imageUrl = this.appConfig.imagesURL;
      var self = this;
      var loadPlans = function () {
        $.ajax({
          url: plansUrl,
          type: "get",
          success: function (plans) {
            if (plans) {
              self.plans = plans;
              $("#types option").remove();
              $("#types").append('<option value="">الكل</option>');
              self.plans.forEach((p) => {
                $("#types").append(
                  `<option value="${p.id}">${
                    lang == "en" ? p.titleEn : p.titleAr
                  }</option>`
                );
              });
            }
            var plan_id = self.urlParams.get("plan_id");
            if (plan_id) {
              $("#types").val(plan_id);
              $("#types").change();
            }
          },
        });
      };
      loadPlans();
      $("#types").change(function (e) {
        let id = $(this).val();
        $("#regions,#govs,#markazes,#sheakhas,#cities").val("");
        $("#regions,#govs,#markazes,#sheakhas,#cities").attr(
          "disabled",
          "disabled"
        );
        let plan = self.plans.find((x) => x.id == id);
        if (plan?.regionLevel == 1) {
          let nationalExtent = self.appConfig?.filterConfig?.nationalExtent;
          console.log("self.appConfig", self.appConfig);
          if (nationalExtent) {
            self.map.centerAndZoom(nationalExtent.center, nationalExtent.zoom);
          }
          let adbId = "1";
          loadPlan(id, adbId);
        }
        if (plan?.regionLevel == 2) {
          $("#regions").removeAttr("disabled");
        }
        if (plan?.regionLevel == 3) {
          $("#regions,#govs").removeAttr("disabled");
        }
        if (plan?.regionLevel == 4) {
          $("#regions,#govs,#markazes").removeAttr("disabled");
        }
        if (plan?.regionLevel == 5) {
          $("#regions,#govs,#markazes,#sheakhas").removeAttr("disabled");
        }
        if (plan?.regionLevel == 6) {
          $("#regions,#govs,#markazes,#cities").removeAttr("disabled");
        }
      });

      $("#regions").change(function () {
        let adbId = $(this).val();
        let typeId = $("#types").val();
        let plan = self.plans.find((x) => x.id == typeId);
        if (plan?.regionLevel == 2) {
          loadPlan(typeId, adbId);
        }
      });

      $("#govs").change(function () {
        let adbId = $(this).val();
        let typeId = $("#types").val();
        let plan = self.plans.find((x) => x.id == typeId);
        if (plan?.regionLevel == 3) {
          loadPlan(typeId, adbId);
        }
      });

      $("#markazes").change(function () {
        let adbId = $(this).val();
        let typeId = $("#types").val();
        let plan = self.plans.find((x) => x.id == typeId);
        if (plan?.regionLevel == 4) {
          loadPlan(typeId, adbId);
        }
      });

      $("#sheakhas").change(function () {
        let adbId = $(this).val();
        let typeId = $("#types").val();
        let plan = self.plans.find((x) => x.id == typeId);
        if (plan?.regionLevel == 5) {
          loadPlan(typeId, adbId);
        }
      });

      $("#cities").change(function () {
        let adbId = $(this).val();
        let typeId = $("#types").val();
        let plan = self.plans.find((x) => x.id == typeId);
        if (plan?.regionLevel == 6) {
          loadPlan(typeId, adbId);
        }
      });

      let loadPlan = function (plan_id, adbId) {
        clearAllLayers(this.map);
        $("#plans").html("");
        if (!plan_id) return;
        $.ajax({
          url: url + "/" + plan_id,
          type: "get",
          success: function (plan) {
            if (plan) {
              loadService(
                decodeURI(plan.serviceUrl),
                JSON.parse(plan.serviceSetting)
              );
              if (plan.phases) {
                plan.phases.forEach((phase) => {
                  addPhase(phase, adbId);
                });
                self.plan = plan;
              }
            }
            _loadUI();
          },
        });
      };
      let addPhase = function (phase, adbId) {
        $("#plans").append(
          '<button class="panel-btn">' +
            (lang == "en" ? phase.titleEn : phase.titleAr) +
            '<img src="themes/PlansTheme/widgets/PlanStandard/images/2arrow-w.png" class="arrow" />' +
            '<img src="themes/PlansTheme/widgets/PlanStandard/images/2arrow.png" class="arrow-active" />' +
            "</button>" +
            '<div class="panel">' +
            '<button class="sub-panel-btn">Maps <span class="panel-btn-arrow">' +
            '<img src="themes/PlansTheme/widgets/PlanStandard/images/2arrow.png" class="arrow" />' +
            '<img src="themes/PlansTheme/widgets/PlanStandard/images/2arrow-w.png" class="arrow-active" />' +
            "</span></button>" +
            '<div class="sub-panel">' +
            '<select class="map-content-select" id="phase-' +
            phase.id +
            '" data-phase="' +
            phase.id +
            '">' +
            getMapOptions(phase.planMaps) +
            "</select>" +
            '<div class="map-content"></div>' +
            "</div>" +
            '<button class="sub-panel-btn">Reports <span class="panel-btn-arrow">' +
            '<img src="themes/PlansTheme/widgets/PlanStandard/images/2arrow.png" class="arrow" />' +
            '<img src="themes/PlansTheme/widgets/PlanStandard/images/2arrow-w.png" class="arrow-active" />' +
            "</span></button>" +
            '<div class="sub-panel">' +
            getReports(phase.planReports, adbId) +
            "</div>" +
            '<button class="sub-panel-btn">Gallery <span class="panel-btn-arrow">' +
            '<img src="themes/PlansTheme/widgets/PlanStandard/images/2arrow.png" class="arrow" />' +
            '<img src="themes/PlansTheme/widgets/PlanStandard/images/2arrow-w.png" class="arrow-active" />' +
            "</span></button>" +
            '<div class="sub-panel">' +
            '<div class="gallery">' +
            getImages(phase.planImages, adbId) +
            "</div>" +
            "</div>" +
            "</div>"
        );
      };
      let getMapOptions = function (maps) {
        if (!maps) return "";
        var result = '<option value="">-- Select Map --</option>';
        maps.forEach((map) => {
          result +=
            '<option value="' +
            map.id +
            '">' +
            (lang == "en" ? map.titleEn : map.titleAr) +
            "</option>";
        });
        return result;
      };
      let getReports = function (reports, adbId) {
        if (!reports) return "";
        var result = "";
        reports.forEach((report) => {
          if (report.adbId == adbId) {
            result +=
              '<div class="report">' +
              '<img src="themes/PlansTheme/widgets/PlanStandard/images/report-b.png">' +
              '<a href="' +
              report.pdfUrl +
              '" target="_blank">' +
              report.fileName +
              "</a>" +
              "</div>";
          }
        });
        return result;
      };
      let getImages = function (images, adbId) {
        if (!images) return "";
        var result = "";
        images.forEach((image) => {
          if (image.adbId == adbId) {
            result +=
              '<div class="item images">' +
              '<a class="light-box" href="' +
              image.imageURL +
              '">' +
              '<img src="' +
              image.imageURL +
              '" />' +
              "<h4>" +
              image.fileName +
              "</h4>" +
              "</a>" +
              "</div>";
          }
        });
        return result;
      };
      let _loadUI = function () {
        $("a.light-box").fancybox();
        $(".panel-btn").click(function () {
          $(".panel-btn").not($(this)).removeClass("active");
          $(".panel-btn").not($(this)).next(".panel").hide();
          $(this).next(".panel").toggle();
          $(this).toggleClass("active");
        });
        $(".sub-panel-btn").click(function () {
          $(this)
            .parent()
            .children(".sub-panel-btn")
            .not($(this))
            .removeClass("active");
          $(this)
            .parent()
            .children(".sub-panel-btn")
            .not($(this))
            .next(".sub-panel")
            .hide();
          $(this).next(".sub-panel").toggle();
          $(this).toggleClass("active");
        });
        $(".map-content-select").change(function () {
          $(".map-content").html("");
          var phase_id = $(this).data("phase");
          var map_id = $(this).val();
          if (phase_id && map_id) {
            $(".map-content").html(getMapContent(phase_id, map_id));
            $(".map-container").unbind("click");
            $(".map-container").click(function () {
              var content_id = $(this).data("content");
              if (content_id) changeService(content_id);
            });
          }
        });
      };
      let addServiceToMap = function (serviceUrl) {
        if (self.lastService == null || self.lastService != serviceUrl) {
          self.lastService = serviceUrl;
          loadService(decodeURI(serviceUrl));
        }
      };
      const clearAllLayers = function (map) {
        for (var i = map.layerIds.length - 1; i >= 0; i--) {
          var layerService = map.getLayer(map.layerIds[i]);
          if (layerService.arcgisProps == undefined) {
            map.removeLayer(layerService);
          }
        }
      };
      const clearLayers = function (map) {
        let maxDXFs = 3;
        let currentLayersCount = map.layerIds.length - 1;
        if (currentLayersCount >= maxDXFs) {
          map.layerIds.forEach((id, index) => {
            if (index !== 0 && index < maxDXFs - 1) {
              map.removeLayer(map.getLayer(id));
            }
          });
        }
      };

      let loadService = function (serviceUrl) {
        lasturl = serviceUrl;
        clearLayers(self.map);
        var addUrlToMap = new AddUrlToMap();
        addUrlToMap.map = self.map;
        addUrlToMap.addService(lasturl, "ArcGIS");
      };
      let getMapContent = function (phase_id, map_id) {
        if (!phase_id || !map_id || !self.plan || !self.plan.phases) return "";
        var result = "";
        self.plan.phases.forEach((phase) => {
          if (phase.id == phase_id) {
            if (phase.planMaps) {
              phase.planMaps.forEach((map) => {
                if (map.id == map_id) {
                  if (map.planMapContents) {
                    map.planMapContents.forEach((content) => {
                      result +=
                        '<div class="map-container" data-content="' +
                        content.id +
                        '">' +
                        '<img src="' +
                        imageUrl +
                        content.imageURL +
                        '">' +
                        '<div class="map-desc">' +
                        "<h4>" +
                        (lang == "en" ? content.titleEn : content.titleAr) +
                        "</h4>" +
                        "<p>" +
                        (lang == "en" ? content.contentEn : content.contentAr) +
                        "</p>" +
                        "</div>" +
                        "</div >";
                    });
                    return result;
                  }
                }
              });
            }
          }
        });
        return result;
      };
      let setVisibleLayers = function (serviceGroups) {
        serviceGroups = serviceGroups || "";
        var layerNames = serviceGroups.split(",");
        for (var i = 0; i < self.map.layerIds.length; i++) {
          var layerService = self.map.getLayer(self.map.layerIds[i]);
          if (layerService.arcgisProps == undefined) {
            var visibleLayerIds = [];
            for (var j = 0; j < layerService.layerInfos.length; j++) {
              if (layerService.layerInfos[j].parentLayerId == -1) {
                if (layerNames.length == 0) {
                  visibleLayerIds.push(layerService.layerInfos[j].id);
                } else {
                  for (k = 0; k < layerNames.length; k++) {
                    if (layerService.layerInfos[j].name == layerNames[k]) {
                      visibleLayerIds.push(layerService.layerInfos[j].id);
                      break;
                    }
                  }
                }
              }
            }
            if (visibleLayerIds.length == 0) visibleLayerIds.push(-1);
            layerService.setVisibleLayers(visibleLayerIds, false);
          }
        }
      };
      let changeService = function (content_id) {
        if (self.plan) {
          if (self.plan.phases) {
            self.plan.phases.forEach((phase) => {
              phase.planMaps.forEach((map) => {
                if (map.planMapContents) {
                  map.planMapContents.forEach((content) => {
                    if (content.id == content_id) {
                      addServiceToMap(content.serviceUrl);
                      // setVisibleLayers(content.serviceGroups);
                      return;
                    }
                  });
                }
              });
            });
          }
        }
      };
    },
    onOpen: function () {},
    initalizeUI: function () {},
  });
});
