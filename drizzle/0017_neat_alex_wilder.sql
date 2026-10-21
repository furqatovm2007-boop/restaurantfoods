ALTER TABLE `bookings` ADD `preorder_items` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `bookings` ADD `preorder_total` integer DEFAULT 0 NOT NULL;