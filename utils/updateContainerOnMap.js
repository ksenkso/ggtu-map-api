const cheerio = require('cheerio');
const fs = require('fs');
const debug = require('debug')('App:Utils');
const path = require('path');
const MAPS_PATH = process.env.MAPS_PATH || path.resolve(__dirname, '../maps/');
/**
 *
 * @param {{map: string}} location
 * @param {String} containerId
 * @param {Number | null} id If null, id attribute will be deleted
 */
module.exports = (location, containerId, id = null) => {
    debug('Id - ' + id);
    const mapPath = path.join(MAPS_PATH, location.map);
    debug('path: ' + mapPath);
    if (fs.existsSync(mapPath)) {
        debug('Path exists');
        const file = fs.readFileSync(mapPath);
        const $ = cheerio.load(file);
        $('#' + containerId).attr('data-id', id);
        const html = $('svg').parent().html();
        fs.writeFileSync(mapPath, html);
    } else {
        console.log(mapPath);
    }
};
