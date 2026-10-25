CREATE TABLE `pos_products` (
	`id` text PRIMARY KEY NOT NULL,
	`restaurant_id` text NOT NULL,
	`barcode` text NOT NULL,
	`name` text NOT NULL,
	`price` integer NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT "pos_products_stock_check" CHECK("pos_products"."stock" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pos_products_barcode_idx` ON `pos_products` (`restaurant_id`,`barcode`);--> statement-breakpoint
CREATE TABLE `pos_sales` (
	`id` text PRIMARY KEY NOT NULL,
	`restaurant_id` text NOT NULL,
	`cashier_id` text NOT NULL,
	`items` text NOT NULL,
	`total` integer NOT NULL,
	`method` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`receipt_no` text NOT NULL,
	`receipt_key` text NOT NULL,
	`received` integer,
	`provider` text,
	`click_trans_id` text,
	`click_prepare_id` integer,
	`payme_transaction` text,
	`payme_state` integer,
	`payme_create_time` integer,
	`payme_perform_time` integer,
	`payme_cancel_time` integer,
	`payme_reason` integer,
	`created_at` text NOT NULL,
	`paid_at` text
);
--> statement-breakpoint
CREATE INDEX `pos_sales_restaurant_idx` ON `pos_sales` (`restaurant_id`,`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `pos_sales_payme_idx` ON `pos_sales` (`payme_transaction`);