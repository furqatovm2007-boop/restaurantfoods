CREATE TABLE `sms_cooldowns` (
	`phone` text PRIMARY KEY NOT NULL,
	`next_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `menu` ADD `image_url` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `menu` ADD `description` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `menu` ADD `category` text DEFAULT '' NOT NULL;