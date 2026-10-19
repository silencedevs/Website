export function validateProjects(input) {
  if (!Array.isArray(input)) throw new Error('projects.json must contain an array.');
  const slugs = new Set();
  return input.map((project) => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug) || slugs.has(project.slug)) throw new Error('Projects require unique lowercase URL slugs.');
    slugs.add(project.slug);
    for (const key of ['name', 'summary', 'description']) if (typeof project[key] !== 'string' || !project[key].trim()) throw new Error(`Project ${project.slug} needs ${key}.`);
    if (!Array.isArray(project.features) || !project.features.every((feature) => typeof feature === 'string' && feature.trim())) throw new Error(`Invalid features for ${project.slug}.`);
    if (!Array.isArray(project.links) || !project.links.length || !project.links.every((link) => typeof link.label === 'string' && link.label.trim() && /^https:\/\//.test(link.url))) throw new Error(`Project ${project.slug} needs labelled HTTPS links.`);
    for (const link of project.links) { const url = new URL(link.url); if (url.username || url.password) throw new Error('Project URLs cannot contain credentials.'); }
    if (project.image && (!/^assets\/[a-zA-Z0-9/_\-.]+\.(png|webp|jpg|jpeg)$/.test(project.image) || project.image.includes('..'))) throw new Error('Project images must be local assets.');
    return project;
  });
}
