export const projects = [
  {
    title: "A quieter kind of city",
    description:
      "An illustrated field guide to finding calm in the middle of Melbourne.",
    category: "Communication design",
    student: "Maya Chen",
    year: "2026",
    popularity: 96,
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "Second nature",
    description:
      "A speculative installation exploring the relationship between people and plants.",
    category: "Interior architecture",
    student: "Oliver Reed",
    year: "2026",
    popularity: 88,
    image:
      "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "Objects with a past",
    description:
      "A photographic study of the traces people leave behind in everyday objects.",
    category: "Photography",
    student: "Amara Patel",
    year: "2026",
    popularity: 91,
    image:
      "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1000&q=85",
  },
];

export const departmentProjects = [
  {
    department: 1,
    title: "A quieter kind of city",
    category: "Communication design",
    description: "An illustrated field guide to finding calm in Melbourne.",
    firstParagraph:
      "This project maps the small, quiet places that offer a pause from the pace of city life. Through field research and illustration, it gives students and residents a thoughtful guide to finding calm in Melbourne.",
    student: "Maya Chen",
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1000&q=85",
  },
  {
    department: 1,
    title: "Objects with a past",
    category: "Photography",
    description: "A photographic study of the traces people leave behind.",
    firstParagraph:
      "Everyday objects carry stories of the people who use them. This photographic series looks closely at wear, repair, and the marks that turn ordinary belongings into personal records.",
    student: "Amara Patel",
    image:
      "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1000&q=85",
  },
  {
    department: 2,
    title: "Second nature",
    category: "Interior architecture",
    description: "A speculative installation about people and plants.",
    firstParagraph:
      "Second Nature imagines shared spaces where plants are active partners in everyday life. The installation explores how light, texture, and adaptable furniture can make a closer relationship with nature part of the city.",
    student: "Oliver Reed",
    image:
      "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1000&q=85",
  },
  {
    department: 2,
    title: "Room to grow",
    category: "Spatial design",
    description: "Flexible spaces for learning, making, and sharing.",
    firstParagraph:
      "Room to Grow proposes a modular learning space that can shift between quiet study and collaborative making. Its reusable components help small communities adapt their surroundings as needs change.",
    student: "Jordan Lee",
    image:
      "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1000&q=85",
  },
  {
    department: 3,
    title: "Signals in motion",
    category: "Digital media",
    description: "An interactive study of movement through public space.",
    firstParagraph:
      "Signals in Motion turns pedestrian movement into a responsive visual experience. The work combines observation and interaction design to reveal the overlooked rhythms of a busy public place.",
    student: "Alex Morgan",
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1000&q=85",
  },
  {
    department: 3,
    title: "Small screen stories",
    category: "Screen production",
    description: "Short-form stories told through everyday moments.",
    firstParagraph:
      "This collection of short films finds moments of connection in ordinary routines. Each story uses a compact visual language to make personal experiences feel immediate and inviting.",
    student: "Sam Nguyen",
    image:
      "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1000&q=85",
  },
  {
    department: 4,
    title: "Future materials",
    category: "Product design",
    description: "New possibilities for reusing overlooked materials.",
    firstParagraph:
      "Future Materials tests how discarded and locally available materials can be transformed into useful objects. A series of prototypes documents the process from material experiments to considered product forms.",
    student: "Taylor Brooks",
    image:
      "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1000&q=85",
  },
  {
    department: 4,
    title: "Better by design",
    category: "Industrial design",
    description: "A practical rethink of the objects we use every day.",
    firstParagraph:
      "Better by Design investigates how small changes to familiar objects can reduce waste and make daily tasks easier. The project combines user research with a set of repairable, long-lasting prototypes.",
    student: "Riley Park",
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1000&q=85",
  },
];

export const departmentNames = {
  1: "Computer Science",
  2: "Business",
  3: "Media & Comm.",
  4: "Design",
};

export const departmentExpertise = {
  1: [
    {
      title: "Web applications",
      description: "Digital platforms built to solve real-world problems.",
    },
    {
      title: "Mobile experiences",
      description: "Useful, intuitive products designed for life on the move.",
    },
    {
      title: "Data & AI",
      description: "Turning information and emerging technology into ideas.",
    },
  ],
  2: [
    {
      title: "Strategy",
      description: "Research-led plans that help organisations move forward.",
    },
    {
      title: "Entrepreneurship",
      description: "New ventures, opportunities, and ideas made actionable.",
    },
    {
      title: "Marketing",
      description: "Connecting people and brands through clear communication.",
    },
  ],
  3: [
    {
      title: "Photos",
      description: "Stories and perspectives captured through the lens.",
    },
    {
      title: "Videos",
      description: "Moving-image work, from short films to digital content.",
    },
    {
      title: "Posters",
      description: "Bold visual communication made to be seen and shared.",
    },
  ],
  4: [
    {
      title: "Graphic design",
      description: "Visual identities, publications, and expressive graphics.",
    },
    {
      title: "Product design",
      description: "Considered objects shaped around people and materials.",
    },
    {
      title: "Spatial concepts",
      description: "Places and environments imagined for new ways of living.",
    },
  ],
};

export function getProjectSlug(project) {
  return project.title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getProjectBySlug(slug) {
  const homepageProject = projects.find(
    (project) => getProjectSlug(project) === slug,
  );
  const departmentProject = departmentProjects.find(
    (project) => getProjectSlug(project) === slug,
  );

  if (!homepageProject && !departmentProject) return null;
  return {
    ...departmentProject,
    ...homepageProject,
    department: departmentProject?.department,
    firstParagraph:
      departmentProject?.firstParagraph ?? homepageProject?.description,
  };
}
