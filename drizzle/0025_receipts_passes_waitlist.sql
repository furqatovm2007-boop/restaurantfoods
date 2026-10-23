CREATE TABLE `waitlist` (
	`id` text PRIMARY KEY NOT NULL,
	`restaurant_id` text NOT NULL,
	`table_number` integer NOT NULL,
	`user_id` text NOT NULL,
	`guests` integer DEFAULT 2 NOT NULL,
	`status` text DEFAULT 'waiting' NOT NULL,
	`notified_at` text,
	`hold_until` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `waitlist_queue` ON `waitlist` (`restaurant_id`,`table_number`,`status`,`created_at`);--> statement-breakpoint
ALTER TABLE `accounts` ADD `no_show_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `bookings` ADD `pass_code` text;--> statement-breakpoint
ALTER TABLE `bookings` ADD `checked_in_at` text;--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_pass_code_unique` ON `bookings` (`pass_code`);--> statement-breakpoint
ALTER TABLE `restaurants` ADD `service_fee_percent` integer DEFAULT 0 NOT NULL;