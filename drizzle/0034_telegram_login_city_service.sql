CREATE TABLE `service_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`restaurant_id` text NOT NULL,
	`booking_id` text NOT NULL,
	`table_number` integer NOT NULL,
	`kind` text NOT NULL,
	`created_at` text NOT NULL,
	`resolved_at` text
);
--> statement-breakpoint
CREATE TABLE `telegram_logins` (
	`code` text PRIMARY KEY NOT NULL,
	`browser_hash` text NOT NULL,
	`chat_id` text,
	`user_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `telegram_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `restaurants` ADD `city` text DEFAULT 'Samarqand' NOT NULL;