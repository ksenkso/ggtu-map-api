'use strict';
const cheerio = require('cheerio');
const fs = require('fs');
const debug = require('debug')('App:Model:Place');
const path = require('path');
const MAPS_PATH = process.env.MAPS_PATH || path.resolve(__dirname, '../maps/');

module.exports = (sequelize, DataTypes) => {
    /**
     * @class Place
     * @extends Sequelize.Model
     */
    const Place = sequelize.define('Place', {
        name: DataTypes.STRING,
        type: DataTypes.STRING,
        container: DataTypes.STRING(8)
    });

    Place.associate = function (models) {
        Place.belongsTo(models.Location);
        Place.hasMany(models.PlaceProps);
        Place.hasMany(models.CabinetProps);
        Place.hasMany(models.WCProps);
        Place.hasMany(models.GymProps);
    };
    Place.defineStatic = function (models) {
        Place.getPropsClass = function (type) {
            debug('Selecting dynamic model props class for type ' + type);
            switch (type) {
                case 'cabinet': {
                    return models.CabinetProps;
                }
                case 'wc': {
                    return models.WCProps;
                }
                case 'gym': {
                    return models.GymProps;
                }
                default:
                    return models.PlaceProps;
            }
        };
    };

    Place.hook('afterSave', async (place, options) => {
        debug('afterSave');
        let shouldUpdate = false;
        for (let i = 0; i < options.fields.length; i++) {
            if (options.fields[i] === 'id' || options.fields[i] === 'container') {
                shouldUpdate = true;
                break;
            }
        }
        if (shouldUpdate) {
            debug('Id - ' + place.id);
            const location = await place.getLocation();
            const mapPath = path.join(MAPS_PATH, location.map);
            debug('path: ' + mapPath);
            if (fs.existsSync(mapPath)) {
                debug('Path exists');
                const file = fs.readFileSync(mapPath);
                const $ = cheerio.load(file);
                $('#' + place.container).attr('data-place-id', place.id);
                const html = $('svg').parent().html();
                console.log(html);
                fs.writeFileSync(mapPath, html);
            } else {
                console.log(mapPath);
            }
        }
    });


    return Place;
};
