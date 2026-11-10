const API_URL = 'http://localhost:3000/api/v1/projects';

export async function fetchProjects() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }

        const projects = await response.json();

        return projects;

    } catch (error) {
        console.error('Error fetching projects:', error);
        return [];
    }
}