const con = require('./connection')

function search(props) {
    return new Promise((resolve, reject) => {
        // console.log(props);
        let qry = ''

        if (props.columns && props.columns.length > 0) {
            const columns = props.columns.join(', ');
            qry = `SELECT ${columns} FROM ??`;
        }

        if (props.condition && props.value != undefined)
            qry += ` WHERE ??=?`
        else {
            reject('please peovide a vlaue for the condition')
            return
        }

        con.query(qry, [props.table, props.condition, props.value], (error, result) => {
            // console.log('Result', result);
            if (error)
                reject(error)
            else
                resolve(result)
        })
    })
}

function insert(props) {
    return new Promise((resolve, reject) => {
        let qry = `INSERT INTO ?? VALUES(?)`
        con.query(qry, [props.table, [...props.values]], (error, result) => {
            // console.log('Result: ',result);
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
}