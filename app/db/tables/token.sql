DROP TABLE IF EXISTS token;
CREATE TABLE token(
  userUuid VARCHAR(36) NOT NULL PRIMARY KEY,
  token      VARCHAR(36) NOT NULL,
  refreshTOken VARCHAR(36) DEFAULT NULL,
  expiredAt DATETIME NOT NULL,
  createdAt    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt    DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO token(userUuid, token, expiredAt)
VALUES (
  'aae91940-26d7-42d2-a095-fb1862e2a78d',
  'ee04f896-fc73-4115-afe3-924f3e0e87a0',
  CURRENT_TIMESTAMP + INTERVAL 1 DAY
);