-- CreateEnum
CREATE TYPE "RFPStatus" AS ENUM ('DRAFT', 'SENT', 'RESPONSES_RECEIVED', 'EVALUATED', 'AWARDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('RECEIVED', 'PARSING', 'PARSED', 'EVALUATED', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "RFP" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "description" TEXT NOT NULL,
    "rawRequirements" TEXT NOT NULL,
    "structuredData" JSONB,
    "budget" DECIMAL(15,2),
    "deadline" TIMESTAMP(3),
    "deliveryDeadline" TIMESTAMP(3),
    "paymentTerms" VARCHAR(200),
    "warrantyRequirements" TEXT,
    "additionalTerms" TEXT,
    "status" "RFPStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RFP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RFPItem" (
    "id" TEXT NOT NULL,
    "rfpId" TEXT NOT NULL,
    "itemType" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "specifications" JSONB,
    "unitBudget" DECIMAL(15,2),
    "priority" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RFPItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "contactPerson" VARCHAR(255),
    "phone" VARCHAR(50),
    "address" TEXT,
    "specializations" TEXT[],
    "rating" DECIMAL(3,2),
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RFPVendor" (
    "id" TEXT NOT NULL,
    "rfpId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailMessageId" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RFPVendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "rfpId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "emailMessageId" VARCHAR(500),
    "subject" VARCHAR(500),
    "rawResponse" TEXT NOT NULL,
    "parsedData" JSONB,
    "totalPrice" DECIMAL(15,2),
    "deliveryTimeline" VARCHAR(200),
    "paymentTerms" VARCHAR(200),
    "warrantyOffered" VARCHAR(200),
    "additionalNotes" TEXT,
    "status" "ProposalStatus" NOT NULL DEFAULT 'RECEIVED',
    "aiScore" DECIMAL(5,2),
    "aiEvaluation" TEXT,
    "complianceScore" DECIMAL(5,2),
    "priceScore" DECIMAL(5,2),
    "termsScore" DECIMAL(5,2),
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evaluatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalItem" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "rfpItemId" TEXT,
    "itemType" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(15,2) NOT NULL,
    "totalPrice" DECIMAL(15,2) NOT NULL,
    "specifications" JSONB,
    "specificationsMet" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "filename" VARCHAR(500) NOT NULL,
    "originalFilename" VARCHAR(500) NOT NULL,
    "filePath" VARCHAR(1000) NOT NULL,
    "mimeType" VARCHAR(200) NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "extractedText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailThread" (
    "id" TEXT NOT NULL,
    "rfpId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "subject" VARCHAR(500) NOT NULL,
    "threadId" VARCHAR(500),
    "lastMessageId" VARCHAR(500),
    "lastMessageAt" TIMESTAMP(3),
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailMessage" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "messageId" VARCHAR(500) NOT NULL,
    "inReplyTo" VARCHAR(500),
    "from" VARCHAR(255) NOT NULL,
    "to" TEXT[],
    "cc" TEXT[],
    "subject" VARCHAR(500) NOT NULL,
    "body" TEXT NOT NULL,
    "bodyHtml" TEXT,
    "isInbound" BOOLEAN NOT NULL,
    "receivedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "entityType" VARCHAR(50) NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RFP_status_idx" ON "RFP"("status");

-- CreateIndex
CREATE INDEX "RFP_createdAt_idx" ON "RFP"("createdAt");

-- CreateIndex
CREATE INDEX "RFPItem_rfpId_idx" ON "RFPItem"("rfpId");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_email_key" ON "Vendor"("email");

-- CreateIndex
CREATE INDEX "Vendor_email_idx" ON "Vendor"("email");

-- CreateIndex
CREATE INDEX "Vendor_isActive_idx" ON "Vendor"("isActive");

-- CreateIndex
CREATE INDEX "RFPVendor_rfpId_idx" ON "RFPVendor"("rfpId");

-- CreateIndex
CREATE INDEX "RFPVendor_vendorId_idx" ON "RFPVendor"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "RFPVendor_rfpId_vendorId_key" ON "RFPVendor"("rfpId", "vendorId");

-- CreateIndex
CREATE INDEX "Proposal_rfpId_idx" ON "Proposal"("rfpId");

-- CreateIndex
CREATE INDEX "Proposal_vendorId_idx" ON "Proposal"("vendorId");

-- CreateIndex
CREATE INDEX "Proposal_status_idx" ON "Proposal"("status");

-- CreateIndex
CREATE INDEX "Proposal_receivedAt_idx" ON "Proposal"("receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Proposal_rfpId_vendorId_key" ON "Proposal"("rfpId", "vendorId");

-- CreateIndex
CREATE INDEX "ProposalItem_proposalId_idx" ON "ProposalItem"("proposalId");

-- CreateIndex
CREATE INDEX "ProposalItem_rfpItemId_idx" ON "ProposalItem"("rfpItemId");

-- CreateIndex
CREATE INDEX "Attachment_proposalId_idx" ON "Attachment"("proposalId");

-- CreateIndex
CREATE INDEX "EmailThread_rfpId_idx" ON "EmailThread"("rfpId");

-- CreateIndex
CREATE INDEX "EmailThread_vendorId_idx" ON "EmailThread"("vendorId");

-- CreateIndex
CREATE INDEX "EmailThread_threadId_idx" ON "EmailThread"("threadId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailThread_rfpId_vendorId_key" ON "EmailThread"("rfpId", "vendorId");

-- CreateIndex
CREATE INDEX "EmailMessage_threadId_idx" ON "EmailMessage"("threadId");

-- CreateIndex
CREATE INDEX "EmailMessage_messageId_idx" ON "EmailMessage"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailMessage_messageId_key" ON "EmailMessage"("messageId");

-- CreateIndex
CREATE INDEX "ActivityLog_entityType_entityId_idx" ON "ActivityLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SystemConfig_key_key" ON "SystemConfig"("key");

-- CreateIndex
CREATE INDEX "SystemConfig_key_idx" ON "SystemConfig"("key");

-- AddForeignKey
ALTER TABLE "RFPItem" ADD CONSTRAINT "RFPItem_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "RFP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RFPVendor" ADD CONSTRAINT "RFPVendor_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "RFP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RFPVendor" ADD CONSTRAINT "RFPVendor_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "RFP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalItem" ADD CONSTRAINT "ProposalItem_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalItem" ADD CONSTRAINT "ProposalItem_rfpItemId_fkey" FOREIGN KEY ("rfpItemId") REFERENCES "RFPItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailThread" ADD CONSTRAINT "EmailThread_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "RFP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailThread" ADD CONSTRAINT "EmailThread_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "EmailThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
