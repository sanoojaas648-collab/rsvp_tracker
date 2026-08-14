CREATE DATABASE IF NOT EXISTS meetup_rsvp
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE meetup_rsvp;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS events (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  location VARCHAR(255) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  created_by INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT chk_events_time_range CHECK (end_time > start_time),
  INDEX idx_events_start_time (start_time),
  INDEX idx_events_created_by (created_by)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rsvps (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  status ENUM('going', 'maybe', 'declined') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_rsvps_event
    FOREIGN KEY (event_id) REFERENCES events(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_rsvps_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT uq_rsvps_event_user UNIQUE (event_id, user_id),
  INDEX idx_rsvps_event_id (event_id),
  INDEX idx_rsvps_user_id (user_id)
) ENGINE=InnoDB;

INSERT INTO users (name, email, password_hash) VALUES
  ('Sanooja', 'sanooja@example.com', '$2b$10$y4fyoTviXmYcUtO1BluuG.k2GskJWQTR9nWCw8h8YwV3/WhVaDwE6'),
  ('Alex',    'alex@example.com',    '$2b$10$y4fyoTviXmYcUtO1BluuG.k2GskJWQTR9nWCw8h8YwV3/WhVaDwE6'),
  ('John',    'john@example.com',    '$2b$10$y4fyoTviXmYcUtO1BluuG.k2GskJWQTR9nWCw8h8YwV3/WhVaDwE6')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO events (id, title, description, location, start_time, end_time, created_by) VALUES
  (1,  'Kochi Frontend Meetup',
       'Monthly meetup for frontend developers in Kochi. Lightning talks on React, Next.js, and whatever framework drama is trending this month. Bring a laptop if you want to pair on something.',
       'Infopark, Kochi',
       DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 DAY), INTERVAL 2 HOUR),
       1),
  (2,  'Weekend Hiking Group',
       'Casual hike up the local trail followed by breakfast at the base. Moderate difficulty, bring water and good shoes.',
       'Athirappilly Trailhead',
       DATE_ADD(NOW(), INTERVAL 9 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 9 DAY), INTERVAL 3 HOUR),
       2),
  (3,  'Board Game Night',
       'Bring your favorite board game or just show up — we always have extras. Pizza and snacks provided.',
       'Community Hall, Ernakulam',
       DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 3 HOUR),
       1),
  (4,  'Startup Founders Coffee Chat',
       'Informal coffee meetup for early-stage founders to swap notes on fundraising, hiring, and everything in between. No pitches, just conversation.',
       'Blue Tokai Coffee, Kochi',
       DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 3 DAY), INTERVAL 1 HOUR),
       3),
  (5,  'Sunset Photography Walk',
       'Walk along the backwaters as the sun goes down. All skill levels welcome — phone cameras count too. We regroup for chai afterwards.',
       'Marine Drive, Kochi',
       DATE_ADD(NOW(), INTERVAL 12 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 12 DAY), INTERVAL 2 HOUR),
       2),
  (6,  'Beginner Yoga in the Park',
       'Gentle, beginner-friendly yoga session outdoors. Mats not provided, so bring your own or a large towel.',
       'Subhash Park, Kochi',
       DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 7 DAY), INTERVAL 1 HOUR),
       3),
  (7,  'Open Mic Poetry Night',
       'Read your own work, someone else''s, or just come listen. Five-minute slots, sign-ups open at the door.',
       'The Yarn Cafe, Kochi',
       DATE_ADD(NOW(), INTERVAL 15 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 15 DAY), INTERVAL 2 HOUR),
       1),
  (8,  'Cycling Club Morning Ride',
       'Easy-paced 20km group ride along the coastal road. Regroup stop halfway for water. All bike types welcome.',
       'Fort Kochi Beach',
       DATE_ADD(NOW(), INTERVAL 4 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 4 DAY), INTERVAL 2 HOUR),
       2),
  (9,  'Retro Game Dev Jam Recap',
       'Show-and-tell for anyone who took part in last month''s game jam. Bring a build if you have one, or just come see what people made.',
       'Infopark, Kochi',
       DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_ADD(DATE_SUB(NOW(), INTERVAL 6 DAY), INTERVAL 3 HOUR),
       3)
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO rsvps (event_id, user_id, status) VALUES
  (1, 2, 'going'), (1, 3, 'maybe'),
  (2, 1, 'going'), (2, 3, 'going'),
  (3, 2, 'going'), (3, 3, 'declined'),
  (4, 1, 'maybe'), (4, 2, 'going'),
  (5, 1, 'going'), (5, 3, 'maybe'),
  (6, 1, 'going'), (6, 2, 'declined'),
  (7, 2, 'going'), (7, 3, 'going'),
  (8, 1, 'going'), (8, 3, 'maybe'),
  (9, 1, 'going'), (9, 2, 'going')
ON DUPLICATE KEY UPDATE status = VALUES(status);
