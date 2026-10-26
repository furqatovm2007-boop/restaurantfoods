CREATE TABLE `table_holds` (
	`id` text PRIMARY KEY NOT NULL,
	`restaurant_id` text NOT NULL,
	`table_number` integer NOT NULL,
	`merged_table` integer,
	`date` text NOT NULL,
	`slot` text NOT NULL,
	`end_slot` text NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `table_holds_lookup_idx` ON `table_holds` (`restaurant_id`,`date`,`expires_at`);--> statement-breakpoint
CREATE INDEX `table_holds_user_idx` ON `table_holds` (`user_id`);--> statement-breakpoint
ALTER TABLE `bookings` ADD `prep_status` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `flowers` ADD `in_stock` integer DEFAULT 1 NOT NULL;