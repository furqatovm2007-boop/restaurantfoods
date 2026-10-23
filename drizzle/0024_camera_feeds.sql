CREATE TABLE `camera_feeds` (
	`id` text PRIMARY KEY NOT NULL,
	`restaurant_id` text NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`device_id` text DEFAULT '' NOT NULL,
	`device_label` text DEFAULT '' NOT NULL,
	`stream_url` text DEFAULT '' NOT NULL,
	`zones` text DEFAULT '[]' NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON UPDATE no action ON DELETE no action
);
