ALTER TABLE `bookings` ADD `call_status` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `bookings` ADD `call_sent_at` text;--> statement-breakpoint
ALTER TABLE `bookings` ADD `call_answered_at` text;