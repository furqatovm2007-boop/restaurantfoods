ALTER TABLE `accounts` ADD `role` text DEFAULT 'customer' NOT NULL;--> statement-breakpoint
ALTER TABLE `accounts` ADD `role_selected` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `accounts` ADD `courier_approved` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `fulfillment` text DEFAULT 'pickup' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `delivery_address` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `delivery_lat` real;--> statement-breakpoint
ALTER TABLE `orders` ADD `delivery_lng` real;--> statement-breakpoint
ALTER TABLE `orders` ADD `delivery_fee` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `courier_id` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `delivery_status` text DEFAULT 'unassigned' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `courier_lat` real;--> statement-breakpoint
ALTER TABLE `orders` ADD `courier_lng` real;--> statement-breakpoint
ALTER TABLE `orders` ADD `location_at` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `location_accuracy` real;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `latitude` real;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `longitude` real;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `image_url` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `hours` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `delivery_enabled` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `delivery_fee` integer DEFAULT 0 NOT NULL;