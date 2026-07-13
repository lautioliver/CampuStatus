-- CreateTable
CREATE TABLE "Zone" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "capacity" TEXT NOT NULL,
    "occupancy" INTEGER NOT NULL DEFAULT 0,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "lastUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Zone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportLevel" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "statusColor" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "ReportLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "clientIp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrendPoint" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrendPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AllowedCampusIp" (
    "id" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AllowedCampusIp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Zone_slug_key" ON "Zone"("slug");

-- CreateIndex
CREATE INDEX "Report_zoneId_createdAt_idx" ON "Report"("zoneId", "createdAt");

-- CreateIndex
CREATE INDEX "TrendPoint_zoneId_recordedAt_idx" ON "TrendPoint"("zoneId", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AllowedCampusIp_ipAddress_key" ON "AllowedCampusIp"("ipAddress");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "ReportLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrendPoint" ADD CONSTRAINT "TrendPoint_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE CASCADE ON UPDATE CASCADE;
