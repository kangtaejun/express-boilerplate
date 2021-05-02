var pool = require('../models/database')

// Handles query execution
function executeQuery(sql, data) {
    return new Promise((resolve, reject) => {
        pool.query(sql, data, (error, results, fields) => {
            if (error) return reject(error);

            resolve(results);
        })
    });
}

module.exports.executeQuery = executeQuery;
