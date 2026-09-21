-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "dueDate" TEXT,
    "userId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Todo" ADD COLUMN "scheduledStart" TIMESTAMP(3);
ALTER TABLE "Todo" ADD COLUMN "scheduledEnd" TIMESTAMP(3);
ALTER TABLE "Todo" ADD COLUMN "projectId" TEXT;

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");
CREATE INDEX "Todo_projectId_idx" ON "Todo"("projectId");
CREATE INDEX "Todo_scheduledStart_idx" ON "Todo"("scheduledStart");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
