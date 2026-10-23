ALTER TABLE `flower_orders` ADD `courier_id` text;--> statement-breakpoint
ALTER TABLE `flowers` ADD `status` text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `flowers` ADD `is_approved` integer DEFAULT 1 NOT NULL;