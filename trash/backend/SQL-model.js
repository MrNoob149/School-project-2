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
        i.resolution as imageResolution

        from project p 

        LEFT JOIN media m ON p.id = m.Project_ID

        LEFT JOIN image i ON m.id = i.id

        ORDER BY  p.id, m.id;`;
    
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
                CreatedAt: row.createdAt,
                UpdatedAt: row.UpdatedAt,
                Category: row.category,
                Student: row.student,
                popularity: row.popularity,
                DepartmentID: row.DepartmentID,
                Expertise: row.expertise,
                images: [],
            } 
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

    return projects;
}

export default getAllProjects;