'use strict';
const express = require('express'),
    router = express.Router(),
    Q = require('q'),
    moment = require('moment'),
    Directory = require('../../../models/gbifdata/directory/directory'),
    TheGbifNetwork = require('../../../models/gbifdata/theGbifNetwork/theGbifNetwork'),
    helper = require('../../../models/util/util'),
    log = require('../../../../config/log');

module.exports = (app) => {
    app.use('/api', router);
};

router.get('/participant/heads/:participantId?', (req, res, next) => {
    Directory.getParticipantHeads(req.params.participantId)
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            log.error('Error in /api/participant/heads controller: ' + err.message);
            next(err);
        });
});

/**
 * This function iterates through active participants to get relevant data counts
 * or registry information.
 *
 * Counts are retrieved differently depending on the participant type.
 */
router.get('/participants/digest', (req, res, next) => {
    let url = 'http://' + req.get('host') + '/api/directory/participants/active',
        query = req.query,
        participants = [];
    // For the GLOBAL view, we don't proceed to extract numbers.
    // if (query.membershipType !== 'other_associate_participant' || (query.gbifRegion === 'GLOBAL' || typeof query.gbifRegion === 'undefined')) {
    //     res.json(participants);
    // }
    // else {


    let promises = [helper.getApiDataPromise(url, {'qs': query}), TheGbifNetwork.getCountryFacets()];

    Q.all(promises)
        .then((result) => {
            let data = result[0];
            let facetMap = result[1];


                data.forEach((datum) => {
                    datum.iso2 = datum.countryCode;
                });
                let participantTasks = [];

                data.forEach((participant) => {
                    participantTasks.push(TheGbifNetwork.getDataCount(participant, facetMap)
                        .then((participant) => {
                            return participant;
                        })
                        .catch((e) => {
                            throw new Error(e);
                        }));
                });

                return Q.all(participantTasks)
                    .then((countedParticipants) => {
                        return countedParticipants;
                    })
                    .catch((e) => {
                        throw new Error(e);
                    });
            })
            .then((countedParticipants) => {
                participants = participants.concat(countedParticipants);
                if (TheGbifNetwork.validateParticipants(participants)) {
                    let endorsedCountTasks = [];
                    participants.forEach((p) => {
                        let url = 'http://' + req.get('host') + '/api/publisher/endorsed-by/' + p.id;
                        endorsedCountTasks.push(helper.getApiDataPromise(url, {})
                            .then((result) => {
                                if (result.hasOwnProperty('count')) {
                                    p.endorsedPublishers = result.count;
                                }
                                return p;
                            })
                            .catch((e) => {
                                throw new Error(e);
                            }));
                    });

                    return Q.all(endorsedCountTasks)
                        .then((participants) => {
                            return participants;
                        })
                        .catch((e) => {
                            throw new Error(e);
                        });
                } else {
                    throw new Error('One or more participants have no id. Abort.');
                }
            })
            .then((participants) => {
                participants.forEach((p) => {
                    p.memberSince = moment(p.membershipStart, 'MMMM YYYY').format('YYYY');
                });

                // sort by membershipType, then name.
                participants.sort((a, b) => {
                    if (a.name < b.name) {
                        return -1;
                    } else if (a.name > b.name) {
                        return 1;
                    }
                });
                res.json(participants);
            })
            .catch((err) => {
                log.error(err);
                let status = err.statusCode || 500;
                res.sendStatus(status);
            });
    // }
});
