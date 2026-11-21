import { Router } from 'express';
import { z } from 'zod';
import type { Demo, Project } from './generated/prisma/client';
import { prisma } from './database';
import { contentId, HttpError, validate } from './http';
import { configurationSchema, demoSchema, projectSchema, revision, slugSchema, technologySchema, type ProjectInput, type PublicProject } from '../shared/content';

const order = [{ position: 'asc' as const }, { id: 'asc' as const }];
const projectCount = { _count: { select: { projects: true } } };
const projectRelations = {
  demos: { orderBy: { position: 'asc' as const }, select: { demoId: true } },
  technologies: { orderBy: { position: 'asc' as const }, select: { technologyId: true } },
};
const byVersion = z.strictObject({ revision });
const conflict = 'Data sudah berubah. Muat ulang studio dan coba lagi.';
const busy = 'Lepaskan item dari semua proyek yang memakainya atau muat ulang studio.';

function serializeProject({ demos, technologies, ...project }: Project & { demos: { demoId: number }[]; technologies: { technologyId: number }[] }) {
  return { ...project, demoIds: demos.map(({ demoId }) => demoId), technologyIds: technologies.map(({ technologyId }) => technologyId) };
}

function serializeDemo({ configuration, _count, ...demo }: Demo & { _count: { projects: number } }) {
  return { ...demo, configuration: configurationSchema.parse(configuration), projectCount: _count.projects };
}

function checkPublication(project: ProjectInput) {
  if (project.published && (!project.approach || !project.outcome || !project.credit || !project.technologyIds.length)) {
    throw new HttpError(400, 'Lengkapi implementasi, hasil, kredit, dan stack teknologi sebelum menerbitkan proyek.');
  }
}

export const publicRoutes = Router();
publicRoutes.get('/projects', async (_req, res) => {
  const projects = await prisma.project.findMany({
    where: { published: true },
    orderBy: order,
    relationLoadStrategy: 'join',
    select: {
      slug: true, title: true, category: true, summary: true, challenge: true, approach: true, outcome: true,
      credit: true, repository: true, liveUrl: true,
      demos: { orderBy: { position: 'asc' }, select: { demo: { select: { slug: true, title: true, description: true, credit: true, configuration: true } } } },
      technologies: { orderBy: { position: 'asc' }, select: { technology: { select: { name: true, category: true, description: true, docsUrl: true } } } },
    },
  });
  const data: PublicProject[] = projects.map(({ demos, technologies, ...project }) => ({
    ...project, technologies: technologies.map(({ technology }) => technology),
    demos: demos.map(({ demo: { configuration, ...demo } }) => ({ ...demo, configuration: configurationSchema.parse(configuration) })),
  }));
  res.json(data);
});

export const adminRoutes = Router();
adminRoutes.get('/projects', async (_req, res) => {
  res.json((await prisma.project.findMany({ orderBy: order, include: projectRelations })).map(serializeProject));
});
adminRoutes.post('/projects', async (req, res) => {
  const payload = validate(projectSchema.extend({ slug: slugSchema }), req.body);
  checkPublication(payload);
  const { demoIds, technologyIds, ...project } = payload;
  const created = await prisma.project.create({
    data: {
      ...project,
      demos: { createMany: { data: demoIds.map((demoId, position) => ({ demoId, position })) } },
      technologies: { createMany: { data: technologyIds.map((technologyId, position) => ({ technologyId, position })) } },
    },
    include: projectRelations,
  });
  res.status(201).json(serializeProject(created));
});
adminRoutes.put('/projects/:id', async (req, res) => {
  const id = contentId(req.params.id);
  const payload = validate(projectSchema.extend({ revision }), req.body);
  checkPublication(payload);
  const { revision: current, demoIds, technologyIds, ...project } = payload;
  const updated = await prisma.$transaction(async (db) => {
    if (!(await db.project.updateMany({ where: { id, revision: current }, data: { ...project, revision: { increment: 1 } } })).count) {
      throw new HttpError(409, conflict);
    }
    await db.projectDemo.deleteMany({ where: { projectId: id } });
    await db.projectTechnology.deleteMany({ where: { projectId: id } });
    await db.projectDemo.createMany({ data: demoIds.map((demoId, position) => ({ projectId: id, demoId, position })) });
    await db.projectTechnology.createMany({ data: technologyIds.map((technologyId, position) => ({ projectId: id, technologyId, position })) });
    return db.project.findUniqueOrThrow({ where: { id }, include: projectRelations });
  });
  res.json(serializeProject(updated));
});
adminRoutes.delete('/projects/:id', async (req, res) => {
  const id = contentId(req.params.id);
  const { revision } = validate(byVersion, req.body);
  if (!(await prisma.project.deleteMany({ where: { id, revision, published: false } })).count) {
    throw new HttpError(409, 'Jadikan proyek draf atau muat ulang studio sebelum menghapusnya.');
  }
  res.sendStatus(204);
});

adminRoutes.get('/demos', async (_req, res) => {
  res.json((await prisma.demo.findMany({ orderBy: { id: 'asc' }, include: projectCount })).map(serializeDemo));
});
adminRoutes.post('/demos', async (req, res) => {
  const data = validate(demoSchema.extend({ slug: slugSchema }), req.body);
  res.status(201).json(serializeDemo(await prisma.demo.create({ data, include: projectCount })));
});
adminRoutes.put('/demos/:id', async (req, res) => {
  const id = contentId(req.params.id);
  const { revision: current, ...data } = validate(demoSchema.extend({ revision }), req.body);
  res.json(serializeDemo(await prisma.demo.update({
    where: { id, revision: current }, data: { ...data, revision: { increment: 1 } }, include: projectCount,
  })));
});
adminRoutes.delete('/demos/:id', async (req, res) => {
  const id = contentId(req.params.id);
  const { revision } = validate(byVersion, req.body);
  if (!(await prisma.demo.deleteMany({ where: { id, revision, projects: { none: {} } } })).count) throw new HttpError(409, busy);
  res.sendStatus(204);
});

adminRoutes.get('/technologies', async (_req, res) => {
  res.json((await prisma.technology.findMany({ orderBy: { id: 'asc' }, include: projectCount })).map(({ _count, ...item }) => ({ ...item, projectCount: _count.projects })));
});
adminRoutes.post('/technologies', async (req, res) => {
  const data = validate(technologySchema, req.body);
  const { _count, ...item } = await prisma.technology.create({ data, include: projectCount });
  res.status(201).json({ ...item, projectCount: _count.projects });
});
adminRoutes.put('/technologies/:id', async (req, res) => {
  const id = contentId(req.params.id);
  const { revision: current, ...data } = validate(technologySchema.extend({ revision }), req.body);
  const { _count, ...item } = await prisma.technology.update({
    where: { id, revision: current }, data: { ...data, revision: { increment: 1 } }, include: projectCount,
  });
  res.json({ ...item, projectCount: _count.projects });
});
adminRoutes.delete('/technologies/:id', async (req, res) => {
  const id = contentId(req.params.id);
  const { revision } = validate(byVersion, req.body);
  if (!(await prisma.technology.deleteMany({ where: { id, revision, projects: { none: {} } } })).count) throw new HttpError(409, busy);
  res.sendStatus(204);
});
