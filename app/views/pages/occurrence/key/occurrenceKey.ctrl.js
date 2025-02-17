'use strict';

var angular = require('angular'),
    _ = require('lodash'),
    globeCreator = require('../../../components/map/basic/globe');

require('../../../components/vocabulary/concept.directive');

angular
    .module('portal')
    .controller('occurrenceKeyCtrl', occurrenceKeyCtrl);

/** @ngInject */
function occurrenceKeyCtrl($state, $sessionStorage, $stateParams, env, hotkeys, Page, OccurrenceRelated, occurrence, SpeciesVernacularName, DatasetProcessSummary, $translate, TRANSLATION_UNCERTAINTY, TRANSLATION_ELEVATION, LOCALE_2_LETTER) {
    var vm = this;
    vm.gb = gb;
    vm.$state = $state;
    vm.LOCALE_2_LETTER = LOCALE_2_LETTER;
    var globe;
    var globeCanvas;
    vm.key = $stateParams.key;
    vm.similarRecords = OccurrenceRelated.get({id: vm.key});
    $translate('occurrence.occurrence').then(function(title) {
        Page.setTitle(title + ' ' + vm.key);
    });
    Page.drawer(false);

    vm.datasetProcessSummary = DatasetProcessSummary.get({key: occurrence.datasetKey});

    vm.mediaExpand = {
        isExpanded: false
    };
    vm.occurrence = occurrence;
    vm.mediaItems = {};
    vm.dataApi = env.dataApi;

    vm.hideDetails = false;

    vm.highlights = {
        issues: {
            expanded: false
        }
    };

    vm.markerMessage = {
        template: '<dl class="inline">{{coordinateUncertainty}}{{elevation}}</dl>',
        coordinateUncertaintyTemplate: '<div><dt>' + TRANSLATION_UNCERTAINTY + '</dt><dd> {{coordinateUncertainty}}m</dd></div>',
        elevationTemplate: '<div><dt>' + TRANSLATION_ELEVATION + '</dt><dd> {{elevation}}</dd></div>',
        elevation: undefined
    };
    vm.getMarkerMessage = function() {
        var message, elevation = '', coordinateUncertainty = '';

        if (vm.data.coordinateUncertaintyInMeters) {
            coordinateUncertainty = vm.markerMessage.coordinateUncertaintyTemplate.replace('{{coordinateUncertainty}}', vm.data.coordinateUncertaintyInMeters);
        }

        if (vm.data.elevation) {
            var e = vm.data.elevation + 'm';
            elevation = vm.markerMessage.elevationTemplate.replace('{{elevation}}', e);
        }

        if ( elevation || coordinateUncertainty) {
            message = vm.markerMessage.template.replace('{{elevation}}', elevation).replace('{{coordinateUncertainty}}', coordinateUncertainty);
           // vm.markers.taxon.message = message;
        }
        return message;
    };


    hotkeys.add({
        combo: 'alt+d',
        description: 'Show record details',
        callback: function() {
            vm.hideDetails = !vm.hideDetails;
            vm.expandMore = false;
        }
    });

    vm.data = occurrence;
    vm.vernacularName = SpeciesVernacularName.get({id: vm.data.taxonKey});

   if (_.get(occurrence, 'extensions["http://rs.tdwg.org/ac/terms/Multimedia"]')) {
       var iiifUris = _.get(occurrence, 'extensions["http://rs.tdwg.org/ac/terms/Multimedia"]')
       .filter(function(e) {
        return e['http://purl.org/dc/elements/1.1/format'] === 'application/ld+json' &&
        (e['http://rs.tdwg.org/ac/terms/serviceExpectation'] &&
        e['http://rs.tdwg.org/ac/terms/serviceExpectation'].toLowerCase() === 'iiif');
       }).map(function(e) {
           return e['http://rs.tdwg.org/ac/terms/accessURI'];
       });
       if (iiifUris.length > 0) {
        vm.iiifManifestUri = iiifUris[0].split('://')[0] + '://labs.gbif.org/mirador/?manifest=' + iiifUris[0];
       }
   }
    if (!vm.iiifManifestUri && _.get(occurrence, 'dynamicProperties')) {
        try {
           var dynProps = JSON.parse(_.get(occurrence, 'dynamicProperties'));
           if (dynProps['iiifManifestUri']) {
            vm.iiifManifestUri = dynProps['iiifManifestUri'].split('://')[0] + '://labs.gbif.org/mirador/?manifest=' + dynProps['iiifManifestUri'];
           }
        } catch (err) {
            // unparsable JSON
        }
    }
    vm.center = {
        point: [vm.data.decimalLongitude, vm.data.decimalLatitude]
    };
    if (vm.data.decimalLatitude && Number(vm.data.decimalLatitude) < -85) {
        vm.projection = 'EPSG:3031';
        vm.center.zoom = 4;
    } else if (vm.data.decimalLatitude && Number(vm.data.decimalLatitude) > 85) {
        vm.projection = 'EPSG:3575';
        vm.center.zoom = 4;
    } else if (vm.data.decimalLatitude) {
        vm.projection = 'EPSG:4326';
        vm.center.zoom = 6;
    }

    if ((typeof vm.data.footprintWKT === 'undefined' || !hasValidOrNoSRS(vm.data)) && (typeof vm.data.decimalLatitude === 'undefined' || typeof vm.data.decimalLongitude === 'undefined')) {
        vm.hideMap = true;
    } else {
        vm.hideMap = false;
    }


    vm.setData = function() {
        // TODO find a better way to parse required data to controller from server without seperate calls
        // vm.occurrenceCoreTerms = gb.occurrenceCoreTerms;

        setMap(vm.data);
        if (typeof vm.data.elevation !== 'undefined') {
            vm.markerMessage.elevation = {
                elevation: vm.data.elevation,
                elevationAccuracy: vm.data.elevationAccuracy
            };
            vm.getMarkerMessage();
        }
    };

    function hasValidOrNoSRS(data) {
        if (typeof data.footprintSRS === 'undefined') {
            return true;
        }

        var footPrintSRS = _.get(data, 'footprintSRS', '').toLowerCase();
        if (footPrintSRS.indexOf('wgs84') > -1 || footPrintSRS.indexOf('wgs_1984') > -1 || footPrintSRS.indexOf('epsg:4326') > -1) {
            return true;
        } else {
            return false;
        }
    }
    function setMap(data) {
        if (typeof data.decimalLatitude !== 'undefined' && typeof data.decimalLongitude !== 'undefined') {
           vm.marker = {point: [data.decimalLongitude, data.decimalLatitude], message: vm.getMarkerMessage(), zoom: vm.center.z};
        }

        if (data.footprintWKT && hasValidOrNoSRS(data)) {
            vm.wkt = data.footprintWKT;
        } else if (data.coordinateUncertaintyInMeters > 1) {
            vm.circle = {
                coordinates: [data.decimalLongitude, data.decimalLatitude],
                radius: data.coordinateUncertaintyInMeters,
                message: vm.getMarkerMessage()
            };
        }

        // create globe
        angular.element(document).ready(function() {
            globeCanvas = document.querySelector('.occurrenceKey__map .globe');
            if (!globe && globeCanvas) {
                globe = globeCreator(globeCanvas, {
                    land: '#4d5258',
                    focus: 'deepskyblue'
                });
                globe.setCenter(vm.data.decimalLatitude, vm.data.decimalLongitude, vm.center.zoom);
                vm.onMapMove = function(lat, lng, zoom) {
                    globe.setCenter(lat, lng, zoom);
                };
            }
        });
    }
}

module.exports = occurrenceKeyCtrl;
