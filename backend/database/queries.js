const con = require('./connection')

function search(params) {
    return new Promise((resolve, reject) => {
        try {
            let qry = ''

            if (params.columns && params.columns.length > 0) {
                const columns = params.columns.join(', ');
                qry = `SELECT ${columns} FROM ??`;
            }

            if (params.where && params.where.length > 0)
                qry += ` WHERE ${params.where}`
            else {
                reject('please peovide a vlaue for the condition')
                return
            }

            con.query(qry, [params.table, params.condition, params.value], (error, result) => {
                // console.log('Result', result);
                if (error)
                    reject(error)
                else
                    resolve(result)
            })
        } catch (error) {
            console.log('search() ERROR: ', error);
            reject(error)
        }
    })
}

function insert(params) {
    return new Promise((resolve, reject) => {
        let qry = `INSERT INTO ?? VALUES(?)`
        con.query(qry, [params.table, [...params.values]], (error, result) => {
            // console.log('Result: ',result);
            if (error)
                reject(error)
            else
                resolve(result)
        })
    })
}

function update(params) {
    return new Promise((resolve, reject) => {
        let qry = `UPDATE ?? SET ${params.set} where ${params.where}`

        con.query(qry, params.table, (error, result) => {
            if (error)
                reject(error)
            else
                resolve(result)
        })
    })
}

module.exports = {
    search,
    insert,
    update,
}