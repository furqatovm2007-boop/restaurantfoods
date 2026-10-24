ALTER TABLE `bookings` ADD `discount_amount` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `bookings` ADD `discount_min_order` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `bookings` ADD `gift_text` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `promo_codes` ADD `discount_type` text DEFAULT 'percent' NOT NULL;--> statement-breakpoint
ALTER TABLE `promo_codes` ADD `amount` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `promo_codes` ADD `min_order` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `promo_codes` ADD `gift` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `promo_codes` ADD `reminded` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `birthday_enabled` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `birthday_kind` text DEFAULT 'percent' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `birthday_amount` integer DEFAULT 100000 NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `birthday_min_order` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `birthday_gift` text DEFAULT '' NOT NULL;--> statement-breakpoint
UPDATE `restaurants` SET `birthday_percent` = 15 WHERE `birthday_percent` = 0;