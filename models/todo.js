/**
 * Created by Christian on 2016-08-21.
 */
//sequelize.import requires special formatting
module.exports = function (sequelize, dataTypes) {
    return sequelize.define('todo', {
        description: {
            type: dataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 250]   //allows len 1-250
            }
        },
        completed: {
            type: dataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });
};