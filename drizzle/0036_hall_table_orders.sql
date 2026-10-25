CREATE TABLE `table_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`restaurant_id` text NOT NULL,
	`table_number` integer NOT NULL,
	`booking_id` text,
	`customer_id` text,
	`customer_name` text DEFAULT '' NOT NULL,
	`customer_phone` text DEFAULT '' NOT NULL,
	`waiter_id` text NOT NULL,
	`waiter_name` text DEFAULT '' NOT NULL,
	`items` text DEFAULT '[]' NOT NULL,
	`service_percent` integer DEFAULT 0 NOT NULL,
	`subtotal` integer DEFAULT 0 NOT NULL,
	`service` integer DEFAULT 0 NOT NULL,
	`total` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`payment` text,
	`receipt_no` text,
	`receipt_key` text NOT NULL,
	`notified_at` text,
	`opened_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`closed_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `table_orders_open_idx` ON `table_orders` (`restaurant_id`,`table_number`) WHERE status = 'open';--> statement-breakpoint
CREATE INDEX `table_orders_restaurant_idx` ON `table_orders` (`restaurant_id`,`closed_at`);