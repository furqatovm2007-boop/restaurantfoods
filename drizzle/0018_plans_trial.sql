-- Subscription plans, 14-day Premium trial, live table occupancy and camera keys.
-- `plan` is the plan the restaurant continues on once it pays; during the trial every feature is on.
ALTER TABLE `restaurants` ADD `plan` text DEFAULT 'premium' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `trial_ends_at` text;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `paid_until` text;--> statement-breakpoint
-- Existing restaurants keep every feature for 14 days after this release instead of losing them on deploy.
UPDATE `restaurants` SET `trial_ends_at`=strftime('%Y-%m-%dT%H:%M:%SZ','now','+14 days');--> statement-breakpoint
-- Demo showcase restaurants always demonstrate the full product.
UPDATE `restaurants` SET `paid_until`='2099-12-31T00:00:00Z' WHERE `is_demo`=1 OR `id` LIKE 'rf-demo-%';--> statement-breakpoint
CREATE TABLE `table_live_status` (
	`restaurant_id` text NOT NULL,
	`table_number` integer NOT NULL,
	`status` text NOT NULL,
	`source` text NOT NULL,
	`confidence` real,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`restaurant_id`, `table_number`),
	FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON UPDATE no action ON DELETE no action
);--> statement-breakpoint
CREATE TABLE `camera_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`restaurant_id` text NOT NULL,
	`key_hash` text NOT NULL,
	`label` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`last_used_at` text,
	`revoked` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON UPDATE no action ON DELETE no action
);--> statement-breakpoint
CREATE UNIQUE INDEX `camera_keys_key_hash_unique` ON `camera_keys` (`key_hash`);
