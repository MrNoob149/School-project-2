// send, receive data from database

import getAllProjects from './SQL-model.js';

const Controller = async (req, res) => {
    try { 
        const project = await getAllProjects();
        res.json(project);
    } catch (error) { 
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }}

    export default Controller;