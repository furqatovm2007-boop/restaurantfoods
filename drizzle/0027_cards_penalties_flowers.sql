CREATE TABLE `flower_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`florist_id` text NOT NULL,
	`flower_id` text NOT NULL,
	`title` text NOT NULL,
	`quantity` integer NOT NULL,
	`total` integer NOT NULL,
	`commission` integer NOT NULL,
	`florist_amount` integer NOT NULL,
	`delivery_type` text NOT NULL,
	`booking_id` text,
	`address` text DEFAULT '' NOT NULL,
	`lat` real,
	`lng` real,
	`phone` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`deliver_at` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'pending_payment' NOT NULL,
	`receipt_id` text,
	`created_at` text NOT NULL,
	`paid_at` text
);
--> statement-breakpoint
CREATE INDEX `flower_orders_florist_idx` ON `flower_orders` (`florist_id`,`status`);--> statement-breakpoint
CREATE INDEX `flower_orders_user_idx` ON `flower_orders` (`user_id`);--> statement-breakpoint
CREATE TABLE `flowers` (
	`id` text PRIMARY KEY NOT NULL,
	`florist_id` text NOT NULL,
	`title` text NOT NULL,
	`kind` text NOT NULL,
	`size` text NOT NULL,
	`price` integer NOT NULL,
	`image_url` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `flowers_florist_idx` ON `flowers` (`florist_id`);--> statement-breakpoint
CREATE TABLE `payment_cards` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`provider` text DEFAULT 'payme' NOT NULL,
	`token` text NOT NULL,
	`masked` text NOT NULL,
	`expire` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_cards_user_id_unique` ON `payment_cards` (`user_id`);--> statement-breakpoint
CREATE TABLE `penalties` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`user_id` text NOT NULL,
	`restaurant_id` text NOT NULL,
	`amount` integer NOT NULL,
	`reason` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`receipt_id` text,
	`error` text,
	`created_at` text NOT NULL,
	`paid_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `penalties_booking_id_unique` ON `penalties` (`booking_id`);--> statement-breakpoint
CREATE INDEX `penalties_restaurant_idx` ON `penalties` (`restaurant_id`,`status`);--> statement-breakpoint
ALTER TABLE `bookings` ADD `penalty_accepted` integer DEFAULT 0 NOT NULL;