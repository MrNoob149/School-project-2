import promisePool from './SQLconnection.js';

const getAllProjects = async () => {
    const sql = `SELECT 
        p.id,
        p.Title,
        p.Introduction,
        p.Description,
        p.CreatedAt,
        p.UpdatedAt,
        p.popularity,
        p.DepartmentID,
        m.id AS imageId,
        i.url AS imageURL,
        i.resolution AS imageResolution

        FROM project p

        LEFT JOIN media m ON p.id = m.Project_ID

        LEFT JOIN image i ON m.id = i.id

        ORDER BY p.id, m.id;`;

    const [rows] = await promisePool.query(sql);
    const projects = [];

    for (const row of rows) { 
        let project = projects.find((item) => item.id === row.id);
        if (!project) { 
            project = { 
                id: row.id,
                Title: row.Title,
                Introduction: row.Introduction,
                Description: row.Description,
                CreatedAt: row.CreatedAt,
                UpdatedAt: row.UpdatedAt,
                Category: row.category,
                Student: row.student,
                popularity: row.popularity,
                DepartmentID: row.DepartmentID,
                images: [],
                expertise: [],
            };

            projects.push(project);
        }

        if (row.imageURL) {
            project.images.push({
                id: row.imageId,
                url: row.imageURL,
                altText: row.imageAltText,
            });
        }
    }

    
    const expertiseSql = `
        SELECT
            pe.Project_ID,
            e.id AS ExpertiseID,
            e.name AS ExpertiseName
        FROM projectexpertise pe
        JOIN expertise e ON pe.Expertise_ID = e.id
        ORDER BY pe.Project_ID, e.id;
    `;

    const [expertiseRows] = await promisePool.query(expertiseSql);

    // Attach expertise to the corresponding projects
    for (const row of expertiseRows) {
        const project = projects.find(
            (item) => item.id === row.Project_ID
        );

        if (project) {
            project.expertise.push({
                id: row.ExpertiseID,
                name: row.ExpertiseName,
            });
        }
    }

    return projects;
};

export default getAllProjects;