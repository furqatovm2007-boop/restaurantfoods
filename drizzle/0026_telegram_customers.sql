CREATE TABLE `telegram_user_links` (
	`code` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `accounts` ADD `telegram_chat_id` text;--> statement-breakpoint
ALTER TABLE `accounts` ADD `telegram_phone` text;