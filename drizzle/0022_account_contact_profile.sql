ALTER TABLE `accounts` ADD `contact_phone_verified` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `accounts` ADD `address` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `accounts` ADD `address_lat` real;--> statement-breakpoint
ALTER TABLE `accounts` ADD `address_lng` real;