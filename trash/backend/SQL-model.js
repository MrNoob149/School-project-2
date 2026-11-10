import promisePool from './SQLconnection.js';

const getAllProjects = async () => {   
    const sql =    `SELECT * FROM project`;
    const [rows] = await promisePool.query(sql);
    return rows;
}

export default getAllProjects;