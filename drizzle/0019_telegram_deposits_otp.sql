-- Telegram notifications, booking deposits (Click / Payme) and booking phone OTP.
ALTER TABLE `restaurants` ADD `telegram_chat_id` text;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `deposit_amount` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `bookings` ADD `deposit_status` text DEFAULT 'not_required' NOT NULL;--> statement-breakpoint
ALTER TABLE `bookings` ADD `phone_verified` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE TABLE `telegram_links` (
	`code` text PRIMARY KEY NOT NULL,
	`restaurant_id` text NOT NULL,
	`created_by` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON UPDATE no action ON DELETE no action
);--> statement-breakpoint
CREATE TABLE `deposits` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`restaurant_id` text NOT NULL,
	`amount` integer NOT NULL,
	`state` text DEFAULT 'pending' NOT NULL,
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
	`paid_at` text,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON UPDATE no action ON DELETE no action
);--> statement-breakpoint
CREATE UNIQUE INDEX `deposits_booking_unique` ON `deposits` (`booking_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `deposits_payme_transaction_unique` ON `deposits` (`payme_transaction`);--> statement-breakpoint
CREATE TABLE `booking_phone_otps` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`phone` text NOT NULL,
	`code_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`verified_at` integer,
	`consumed` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
