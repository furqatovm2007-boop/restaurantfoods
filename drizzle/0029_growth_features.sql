CREATE TABLE `peak_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`restaurant_id` text NOT NULL,
	`days` text DEFAULT '' NOT NULL,
	`date` text DEFAULT '' NOT NULL,
	`start` text NOT NULL,
	`end` text NOT NULL,
	`amount` integer NOT NULL,
	`label` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `peak_rules_restaurant_idx` ON `peak_rules` (`restaurant_id`);--> statement-breakpoint
CREATE TABLE `promo_codes` (
	`code` text PRIMARY KEY NOT NULL,
	`restaurant_id` text NOT NULL,
	`user_id` text NOT NULL,
	`percent` integer NOT NULL,
	`kind` text NOT NULL,
	`year` integer NOT NULL,
	`expires_at` text NOT NULL,
	`used_booking_id` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `promo_codes_once_idx` ON `promo_codes` (`restaurant_id`,`user_id`,`kind`,`year`);--> statement-breakpoint
CREATE TABLE `restaurant_staff` (
	`restaurant_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`restaurant_id`, `user_id`)
);
--> statement-breakpoint
CREATE INDEX `restaurant_staff_user_idx` ON `restaurant_staff` (`user_id`);--> statement-breakpoint
CREATE TABLE `service_alerts` (
	`id` text PRIMARY KEY NOT NULL,
	`restaurant_id` text NOT NULL,
	`table_number` integer NOT NULL,
	`minutes` integer NOT NULL,
	`created_at` text NOT NULL,
	`resolved_at` text
);
--> statement-breakpoint
CREATE INDEX `service_alerts_restaurant_idx` ON `service_alerts` (`restaurant_id`,`resolved_at`);--> statement-breakpoint
ALTER TABLE `accounts` ADD `birth_date` text;--> statement-breakpoint
ALTER TABLE `bookings` ADD `merged_table` integer;--> statement-breakpoint
ALTER TABLE `bookings` ADD `promo_code` text;--> statement-breakpoint
ALTER TABLE `bookings` ADD `discount_percent` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `bookings` ADD `discount_reason` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurant_tables` ADD `view_url` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `birthday_percent` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `happy_enabled` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `happy_threshold` integer DEFAULT 70 NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `happy_percent` integer DEFAULT 15 NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `service_timer_min` integer DEFAULT 7 NOT NULL;--> statement-breakpoint
ALTER TABLE `table_live_status` ADD `seated_at` text;--> statement-breakpoint
ALTER TABLE `table_live_status` ADD `served_at` text;--> statement-breakpoint
ALTER TABLE `table_live_status` ADD `alerted_at` text;