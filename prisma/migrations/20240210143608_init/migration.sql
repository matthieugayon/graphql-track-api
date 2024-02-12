-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "artistName" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "ISRC" TEXT NOT NULL,
    "releaseDate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Track_ISRC_key" ON "Track"("ISRC");

-- CreateIndex
CREATE UNIQUE INDEX "Track_name_artistName_key" ON "Track"("name", "artistName");
