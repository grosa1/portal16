'use strict';
let express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    format = rootRequire('app/helpers/format'),
    backboneDatasetKey = rootRequire('config/config').publicConstantKeys.dataset.backbone,
    resourceSearch = require('../resource/search/resourceSearch'),
    Dataset = require('./datasetSearch'),
    Species = require('./species'),
    SpeciesMatch = require('./speciesMatches'),
    Publisher = require('./publisher'),
    Participant = require('./participant'),
    Country = require('./countrySearch'),
    SequenceMatch = require('./sequences');

module.exports = function(app) {
    app.use('/api', router);
};

router.get('/omniSearch', function(req, res) {
    let query = req.query.q || '',
        preferedLocale = req.query.locale || 'en';

    search(query, preferedLocale, res.__)
        .then(function(result) {
            res.json(result);
        })
        .catch(function(err) {
            res.status(500);
            res.send('SERVER FAILURE');
            console.log(err);
        });
});

async function search(query, preferedLocale, __) {
    query = _.isString(query) ? query.toLowerCase() : query;
    // removing highlights as a temporary measure as the implementation to show them doesn't work. See also https://github.com/gbif/portal16/issues/1358
    let datasets = Dataset.query({q: query, limit: 3, hl: true});
    let publishers = Publisher.query({q: query, limit: 3});
    let participants = Participant.query(query);
    let species = Species.query({q: query, datasetKey: backboneDatasetKey, limit: 3, hl: true});
    let speciesMatches = SpeciesMatch.query({name: query, verbose: true, hl: true});
    let resources = resourceSearch.search({q: query, searchable: true, locale: preferedLocale, limit: 10}, __);
    let faq = resourceSearch.search({q: query, searchable: true, contentType: ['help'], locale: preferedLocale, limit: 5}, __);
    let sequences = SequenceMatch.query(query);
    let resourceHighlights = resourceSearch.search(
        {
            keywords: query,
            contentType: ['network', 'dataUse', 'event', 'news', 'project', 'programme', 'tool', 'article', 'document'],
            locale: preferedLocale, limit: 2, searchable: true
            }, __);
    let country = Country.query(query, preferedLocale);

    let values = await Promise.all([speciesMatches, species, datasets, publishers, resources, country, resourceHighlights, participants, faq, sequences]);
    let datasetsResponse = values[2];
    let datasetUuidMatches = datasetsResponse.results.filter(function(x) {
      return x.key === query.trim() || x.title === query.trim();
    });

    let response = {
        speciesMatches: values[0],
        species: values[1],
        datasets: datasetsResponse,
        datasetUuidMatches: datasetUuidMatches,
        publishers: values[3],
        resources: values[4],
        country: values[5],
        resourceHighlights: values[6],
        participants: values[7],
        faq: values[8],
        sequences: values[9]
    };

    response.species.results = pruneDuplicateSpecies(response.speciesMatches, response.species.results);
    response.speciesMatches = transformMatches(response.speciesMatches);
    // response.species.results = _.slice(_.concat(response.speciesMatches.results, response.species.results), 0, 3);
    addTypes(response);

    pruneDuplicateResources(response.resources, response.resourceHighlights);
    // addSearchFieldsToAll(response);

    format.sanitizeArrayField(response.datasets.results, 'description');
    return response;
}

function pruneDuplicateSpecies(matches, species) {
    let matchIds = _.map(matches, 'usageKey');
    return _.filter(species, function(e) {
        return !_.includes(matchIds, e.key);
    });
}

function pruneDuplicateResources(otherResults, keywordResults) {
    otherResults.results = _.differenceBy(otherResults.results, keywordResults.results, 'id');
}

function addTypes(response) {
    addType(response.speciesMatches.results, 'species');
    addType(response.species.results, 'species');
    addType(response.datasets.results, 'dataset');
    addType(response.publishers.results, 'publisher');
    addType(response.resources.results, 'resource');
}

function addType(results, type) {
    results.forEach(function(e) {
        e._type = type;
    });
}

function transformMatches(speciesMatches) {
    speciesMatches.forEach(function(e) {
        e.key = e.usageKey;
        e.taxonomicStatus = e.status;
    });
    return {
        count: speciesMatches.length,
        limit: speciesMatches.length,
        offset: 0,
        results: speciesMatches
    };
}
