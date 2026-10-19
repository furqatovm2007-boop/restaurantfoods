CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`restaurant_id` text NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`slot` text NOT NULL,
	`table_number` integer NOT NULL,
	`guests` integer NOT NULL,
	`phone` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `menu` (
	`id` text PRIMARY KEY NOT NULL,
	`restaurant_id` text NOT NULL,
	`name` text NOT NULL,
	`price` integer NOT NULL,
	`ingredients` text DEFAULT '' NOT NULL,
	`allergens` text DEFAULT '' NOT NULL,
	`available` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`restaurant_id` text NOT NULL,
	`user_id` text NOT NULL,
	`items` text NOT NULL,
	`total` integer NOT NULL,
	`phone` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`window` integer NOT NULL,
	`count` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`restaurant_id` text NOT NULL,
	`user_id` text NOT NULL,
	`stars` integer NOT NULL,
	`comment` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reviews_one_per_customer` ON `reviews` (`restaurant_id`,`user_id`);--> statement-breakpoint
ALTER TABLE `restaurants` ADD `address` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `phone` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `description` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `cuisine` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `tables` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `capacity` integer DEFAULT 4 NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `slots` text DEFAULT '[]' NOT NULL;