let express = require('express'),
    router = express.Router();

module.exports = function(app) {
    app.use('/', router);
};


router.get('/tools/data-validator-legacy', function(req, res) {
    res.render('pages/tools/dataValidator_legacy/dataValidator', {
        _meta: {
            title: req.__('validation.dataValidator'),
            description: req.__('validation.dataValidatorDescription'),
            noIndex: true
        }
    });
});


router.get('/tools/data-validator-legacy/about', render);
router.get('/tools/data-validator-legacy/extensions', render);
router.get('/tools/data-validator-legacy/:jobid', render);
router.get('/tools/data-validator-legacy/:jobid/document', render);
router.get('/tools/data-validator-legacy/:jobid/extensions', render);
// router.get('/tools/data-validator/:jobid/about', render);


function render(req, res, next) {
    res.render('pages/tools/dataValidator_legacy/dataValidator', {
        _meta: {
            title: req.__('validation.dataValidator'),
            description: req.__('validation.dataValidatorDescription'),
            noIndex: true
        },
        jobId: req.params.jobid
    });
}