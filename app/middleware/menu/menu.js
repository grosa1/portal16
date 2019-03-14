/**
 add menu to all requests.
 */
let menuBuilder = require('./menuBuilder');
let fallbackMenu = menuBuilder.fallbackMenu;
let getMenu = menuBuilder.getMenu;

let menus = {};
async function getMenuData(locale, __) {
    // if cached version ready, then use that
    let cachedMenu = menus[locale];
    if (cachedMenu) {
        return cachedMenu;
    }
    return getMenu(locale, __)
        .then(function(dynamicMenu) {
            menus[locale] = dynamicMenu;
            if (!cachedMenu) {
                return dynamicMenu;
            }
        }).catch(function() {
            if (!cachedMenu) {
                return fallbackMenu;
            }
        });
}

function use(app) {
    app.use(function(req, res, next) {
        getMenuData(res.locals.gb.locales.current, req.__)
            .then(function(menuDynamic) {
                res.locals.gb = res.locals.gb || {};
                res.locals.gb.menu = menuDynamic;
                next();
            }).catch(function() {
                res.locals.gb = res.locals.gb || {};
                res.locals.gb.menu = fallbackMenu;
                next();
            });
    });
}

module.exports = {
    use: use
};

