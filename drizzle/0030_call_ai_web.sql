ALTER TABLE `bookings` ADD `call_token` text;--> statement-breakpoint
ALTER TABLE `bookings` ADD `call_channel` text DEFAULT '' NOT NULL;