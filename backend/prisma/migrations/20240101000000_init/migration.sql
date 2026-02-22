-- CreateTable
CREATE TABLE "Release" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "additionalInfo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Release_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReleaseStep" (
    "id" TEXT NOT NULL,
    "releaseId" TEXT NOT NULL,
    "stepIndex" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ReleaseStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReleaseStep_releaseId_stepIndex_key" ON "ReleaseStep"("releaseId", "stepIndex");

-- AddForeignKey
ALTER TABLE "ReleaseStep" ADD CONSTRAINT "ReleaseStep_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;
