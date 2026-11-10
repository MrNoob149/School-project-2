import app from './request.js';

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/api/v1/project`);
});
