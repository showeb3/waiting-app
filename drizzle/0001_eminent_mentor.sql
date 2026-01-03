CREATE TABLE `printJobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`storeId` int NOT NULL,
	`status` enum('pending','success','failed') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `printJobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pushSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pushSubscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `staffAssignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`storeId` int NOT NULL,
	`role` enum('staff','manager') NOT NULL DEFAULT 'staff',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `staffAssignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`nameEn` varchar(255),
	`ownerId` int NOT NULL,
	`isOpen` boolean NOT NULL DEFAULT true,
	`operatingHours` text,
	`notificationThreshold3` int NOT NULL DEFAULT 3,
	`notificationThreshold1` int NOT NULL DEFAULT 1,
	`skipRecoveryMode` enum('end','near','resubmit') NOT NULL DEFAULT 'end',
	`printMethod` enum('local_bridge','direct') NOT NULL DEFAULT 'local_bridge',
	`kioskSettings` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stores_id` PRIMARY KEY(`id`),
	CONSTRAINT `stores_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`token` varchar(64) NOT NULL,
	`guestName` varchar(255) NOT NULL,
	`partySize` int NOT NULL,
	`status` enum('WAITING','CALLED','SEATED','SKIPPED','CANCELLED') NOT NULL DEFAULT 'WAITING',
	`sequenceNumber` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`calledAt` timestamp,
	`seatedAt` timestamp,
	`skippedAt` timestamp,
	`cancelledAt` timestamp,
	`source` enum('qr','kiosk') NOT NULL DEFAULT 'qr',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tickets_id` PRIMARY KEY(`id`),
	CONSTRAINT `tickets_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','staff') NOT NULL DEFAULT 'user';