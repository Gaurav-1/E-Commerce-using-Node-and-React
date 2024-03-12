const con = require('./connection')

function search(params) {
    return new Promise((resolve, reject) => {
        try {
            let qry = ''

            if (params.columns && params.columns.length > 0) {
                // const columns = params.columns.join(', ');
                qry = `SELECT ${params.columns} FROM ??`;
            }

            if (params.where && params.where.length > 0)
                qry += ` WHERE ${params.where}`

            if (params.limit && params.skip)
                qry += ` LIMIT ${params.limit} OFFSET ${params.skip}`
            if(params.limit < 1 ){
                reject('please provide limit and offset')
                return
            }
            
            con.query(qry, [params.table], (error, result) => {
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