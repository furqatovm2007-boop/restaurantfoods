-- Demo showcase restaurants spread over the three plans so each plan can be seen working:
-- Start: plain 2D menu and list booking; Business: 3D menu, Admin AI, live tables;
-- Premium: everything, including the 3D hall and the customer AI.
UPDATE `restaurants` SET `plan`='start' WHERE `id` IN ('rf-demo-restaurant-03','rf-demo-restaurant-06','rf-demo-restaurant-09');--> statement-breakpoint
UPDATE `restaurants` SET `plan`='business' WHERE `id` IN ('rf-demo-restaurant-02','rf-demo-restaurant-05','rf-demo-restaurant-08');--> statement-breakpoint
UPDATE `restaurants` SET `plan`='premium' WHERE `id` IN ('rf-demo-restaurant-01','rf-demo-restaurant-04','rf-demo-restaurant-07','rf-demo-restaurant-10');
