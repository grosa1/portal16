'use strict';

// var angular = require('angular'); it is required, but included in the main build. We need a better way to load bootstrap controllers async

angular
    .module('portal')
    .controller('homeCtrl', homeCtrl);

/** @ngInject */
function homeCtrl($http, suggestEndpoints, Page) {
    var vm = this;
    Page.setTitle('GBIF');
    Page.drawer(false);
    vm.mapView = undefined;
    vm.freeTextQuery;
    vm.mapOptions = {
        points: true
    };
    vm.mapFilter = {};

    function getLatest() {
        var geoip = $http.get('/api/utils/geoip/country');
        geoip.then(function(response) {
            if (response.status !== 200) {
                return;
            }
            vm.country = response.data;
            // to avoid too much offset cap latitude
            vm.country.location[0] = Math.min(vm.country.location[0], 40);
            vm.country.location[0] = Math.max(vm.country.location[0], -40);
            vm.mapView = {
                center: [vm.country.location[0], vm.country.location[1]],
                zoom: 3
            };
        }).catch(function() {
            // ignore missing
        });
    }
    getLatest();

    vm.getSuggestions = function(val) {
        return $http.get(suggestEndpoints.taxon, {
            params: {
                q: val,
                limit: 10
            }
        }).then(function(response) {
            return response.data;
        });
    };

    vm.typeaheadSelect = function(item) { //  model, label, event
        vm.mapFilter = {taxon_key: item.key};
    };

    vm.searchOnEnter = function() {
        vm.searchOnEnter = function(event) {
            if (event.which === 13 && !vm.selectedSpecies) {
                vm.mapFilter = {};
            }
        };
    };

    vm.updateSearch = function() {
        location.href = '/search?q=' + encodeURIComponent(vm.freeTextQuery);
    };





    vm.myInterval = 0;
    vm.noWrapSlides = false;
    vm.active = 0;
    var slides = vm.slides = []; 
    var currIndex = 0;

  vm.addSlide = function() {
    var newWidth = 600 + slides.length + 1;
    slides.push({
      image: '//unsplash.it/' + newWidth + '/300',
      text: ['Nice image', 'Awesome photograph', 'That is so cool', 'I love that'][slides.length % 4],
      id: currIndex++
    });
  };

  vm.randomize = function() {
    var indexes = generateIndexesArray();
    assignNewIndexesToSlides(indexes);
  };

  for (var i = 0; i < 4; i++) {
    vm.addSlide();
  }

  // Randomize logic below

  function assignNewIndexesToSlides(indexes) {
    for (var i = 0, l = slides.length; i < l; i++) {
      slides[i].id = indexes.pop();
    }
  }

  function generateIndexesArray() {
    var indexes = [];
    for (var i = 0; i < currIndex; ++i) {
      indexes[i] = i;
    }
    return shuffle(indexes);
  }

  // http://stackoverflow.com/questions/962802#962890
  function shuffle(array) {
    var tmp, current, top = array.length;

    if (top) {
      while (--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
      }
    }

    return array;
  }
}

module.exports = homeCtrl;
