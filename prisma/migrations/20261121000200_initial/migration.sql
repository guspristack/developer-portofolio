-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "challenge" TEXT NOT NULL,
    "approach" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "credit" TEXT NOT NULL,
    "repository" TEXT NOT NULL,
    "liveUrl" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Demo" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "credit" TEXT NOT NULL,
    "configuration" JSONB NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Demo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Technology" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "docsUrl" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Technology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectDemo" (
    "projectId" INTEGER NOT NULL,
    "demoId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ProjectDemo_pkey" PRIMARY KEY ("projectId","demoId")
);

-- CreateTable
CREATE TABLE "ProjectTechnology" (
    "projectId" INTEGER NOT NULL,
    "technologyId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ProjectTechnology_pkey" PRIMARY KEY ("projectId","technologyId")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "sid" VARCHAR NOT NULL,
    "sess" JSON NOT NULL,
    "expire" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_published_position_idx" ON "Project"("published", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Demo_slug_key" ON "Demo"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Technology_name_key" ON "Technology"("name");

-- CreateIndex
CREATE INDEX "ProjectDemo_demoId_idx" ON "ProjectDemo"("demoId");

-- CreateIndex
CREATE INDEX "ProjectTechnology_technologyId_idx" ON "ProjectTechnology"("technologyId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "session_expire_idx" ON "session"("expire");

-- AddForeignKey
ALTER TABLE "ProjectDemo" ADD CONSTRAINT "ProjectDemo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDemo" ADD CONSTRAINT "ProjectDemo_demoId_fkey" FOREIGN KEY ("demoId") REFERENCES "Demo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTechnology" ADD CONSTRAINT "ProjectTechnology_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTechnology" ADD CONSTRAINT "ProjectTechnology_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "Technology"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
