CREATE TABLE `restaurant_tables` (
	`id` text PRIMARY KEY NOT NULL,
	`restaurant_id` text NOT NULL,
	`number` integer NOT NULL,
	`floor` integer DEFAULT 1 NOT NULL,
	`seats` integer NOT NULL,
	`atmosphere` text DEFAULT '' NOT NULL,
	`image_url` text DEFAULT '' NOT NULL,
	`x` real DEFAULT 50 NOT NULL,
	`y` real DEFAULT 50 NOT NULL,
	`shape` text DEFAULT 'round' NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `restaurant_table_number` ON `restaurant_tables` (`restaurant_id`,`number`);--> statement-breakpoint
ALTER TABLE `bookings` ADD `end_slot` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `floors` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `booking_open` text DEFAULT '09:00' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `booking_close` text DEFAULT '23:00' NOT NULL;
--> statement-breakpoint
CREATE TRIGGER bookings_no_overlap_insert BEFORE INSERT ON bookings WHEN NEW.status IN ('pending','confirmed') BEGIN SELECT RAISE(ABORT,'booking_overlap') WHERE EXISTS (SELECT 1 FROM bookings b WHERE b.id<>NEW.id AND b.restaurant_id=NEW.restaurant_id AND b.date=NEW.date AND b.table_number=NEW.table_number AND b.status IN ('pending','confirmed') AND (CAST(substr(b.slot,1,2) AS INTEGER)*60+CAST(substr(b.slot,4,2) AS INTEGER))<(CASE WHEN NEW.end_slot<>'' THEN CAST(substr(NEW.end_slot,1,2) AS INTEGER)*60+CAST(substr(NEW.end_slot,4,2) AS INTEGER) ELSE (CAST(substr(NEW.slot,1,2) AS INTEGER)*60+CAST(substr(NEW.slot,4,2) AS INTEGER))+120 END) AND (CASE WHEN b.end_slot<>'' THEN CAST(substr(b.end_slot,1,2) AS INTEGER)*60+CAST(substr(b.end_slot,4,2) AS INTEGER) ELSE (CAST(substr(b.slot,1,2) AS INTEGER)*60+CAST(substr(b.slot,4,2) AS INTEGER))+120 END)>(CAST(substr(NEW.slot,1,2) AS INTEGER)*60+CAST(substr(NEW.slot,4,2) AS INTEGER))); END;

--> statement-breakpoint
CREATE TRIGGER bookings_no_overlap_update BEFORE UPDATE ON bookings WHEN NEW.status IN ('pending','confirmed') BEGIN SELECT RAISE(ABORT,'booking_overlap') WHERE EXISTS (SELECT 1 FROM bookings b WHERE b.id<>NEW.id AND b.restaurant_id=NEW.restaurant_id AND b.date=NEW.date AND b.table_number=NEW.table_number AND b.status IN ('pending','confirmed') AND (CAST(substr(b.slot,1,2) AS INTEGER)*60+CAST(substr(b.slot,4,2) AS INTEGER))<(CASE WHEN NEW.end_slot<>'' THEN CAST(substr(NEW.end_slot,1,2) AS INTEGER)*60+CAST(substr(NEW.end_slot,4,2) AS INTEGER) ELSE (CAST(substr(NEW.slot,1,2) AS INTEGER)*60+CAST(substr(NEW.slot,4,2) AS INTEGER))+120 END) AND (CASE WHEN b.end_slot<>'' THEN CAST(substr(b.end_slot,1,2) AS INTEGER)*60+CAST(substr(b.end_slot,4,2) AS INTEGER) ELSE (CAST(substr(b.slot,1,2) AS INTEGER)*60+CAST(substr(b.slot,4,2) AS INTEGER))+120 END)>(CAST(substr(NEW.slot,1,2) AS INTEGER)*60+CAST(substr(NEW.slot,4,2) AS INTEGER))); END;
