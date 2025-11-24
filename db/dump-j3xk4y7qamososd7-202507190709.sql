/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.7.2-MariaDB, for osx10.20 (arm64)
--
-- Host: thzz882efnak0xod.cbetxkdyhwsb.us-east-1.rds.amazonaws.com    Database: j3xk4y7qamososd7
-- ------------------------------------------------------
-- Server version	10.11.10-MariaDB-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `SequelizeMeta`
--

DROP TABLE IF EXISTS SequelizeMeta;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE SequelizeMeta (
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SequelizeMeta`
--

LOCK TABLES `SequelizeMeta` WRITE;
/*!40000 ALTER TABLE `SequelizeMeta` DISABLE KEYS */;
INSERT INTO `SequelizeMeta` VALUES
('20180828045045-create-file.js'),
('20180829083718-create-options.js'),
('20180902052327-create-dbusers.js'),
('20180905111624-create-loginmapping.js'),
('20220129042050-create-user-text.js');
/*!40000 ALTER TABLE `SequelizeMeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dbusers`
--

DROP TABLE IF EXISTS `dbusers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dbusers` (
  `userId` varchar(255) NOT NULL,
  `userType` varchar(255) DEFAULT NULL,
  `fid` varchar(255) DEFAULT '0',
  `lan_id` int(11) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `middle_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `userName` varchar(255) DEFAULT NULL,
  `user_slug` varchar(255) DEFAULT NULL,
  `share_username` varchar(255) DEFAULT NULL,
  `emailId` varchar(255) DEFAULT NULL,
  `contact_code` varchar(255) DEFAULT NULL,
  `contactNumber` varchar(255) DEFAULT NULL,
  `alternateNumber` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `user_address` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `dob` date DEFAULT NULL COMMENT 'Store DOB in Date format',
  `age` int(11) DEFAULT NULL,
  `member_type` varchar(255) DEFAULT NULL,
  `sms_notification` int(11) DEFAULT NULL,
  `email_notification` int(11) DEFAULT NULL,
  `lastLogin` datetime DEFAULT NULL,
  `verificationCode` varchar(255) DEFAULT '',
  `user_code` varchar(255) DEFAULT NULL,
  `emailverificationCode` varchar(255) DEFAULT '',
  `relatedIP` varchar(255) DEFAULT '',
  `FcmUserToken` varchar(255) DEFAULT '',
  `IMEINumber` varchar(255) DEFAULT '',
  `status` int(11) DEFAULT NULL,
  `active_date` datetime DEFAULT NULL,
  `createdBy` varchar(255) DEFAULT NULL,
  `updatedBy` varchar(255) DEFAULT NULL,
  `CreateDateTime` datetime NOT NULL,
  `UpdateDateTime` datetime NOT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `dbusers_user_type_user_slug_contact_number` (`userType`,`user_slug`,`contactNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dbusers`
--

LOCK TABLES `dbusers` WRITE;
/*!40000 ALTER TABLE `dbusers` DISABLE KEYS */;
/*!40000 ALTER TABLE `dbusers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `file`
--

DROP TABLE IF EXISTS `file`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `file` (
  `file_id` varchar(255) NOT NULL,
  `term_id` varchar(255) DEFAULT NULL,
  `term_type` varchar(255) DEFAULT NULL COMMENT 'Type i.e category or product',
  `file_name` varchar(255) DEFAULT NULL,
  `file_title` varchar(255) DEFAULT '',
  `file_size` varchar(255) DEFAULT NULL,
  `file_ext` varchar(255) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `verify` varchar(255) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `CreateDateTime` datetime NOT NULL,
  `UpdateDateTime` datetime NOT NULL,
  PRIMARY KEY (`file_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `file`
--

LOCK TABLES `file` WRITE;
/*!40000 ALTER TABLE `file` DISABLE KEYS */;
/*!40000 ALTER TABLE `file` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login_mapping`
--

DROP TABLE IF EXISTS `login_mapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `login_mapping` (
  `id` varchar(255) DEFAULT NULL,
  `userId` varchar(255) DEFAULT NULL,
  `lastLogin` datetime DEFAULT NULL,
  `FcmUserToken` varchar(255) DEFAULT NULL,
  `IMEINumber` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_mapping`
--

LOCK TABLES `login_mapping` WRITE;
/*!40000 ALTER TABLE `login_mapping` DISABLE KEYS */;
/*!40000 ALTER TABLE `login_mapping` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `options`
--

DROP TABLE IF EXISTS `options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `options` (
  `option_id` varchar(255) NOT NULL,
  `option_type` varchar(255) DEFAULT NULL,
  `option_name` varchar(255) DEFAULT NULL,
  `option_slug` varchar(255) DEFAULT NULL,
  `option_desc` text DEFAULT NULL,
  `option_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`option_value`)),
  `status` int(11) NOT NULL DEFAULT 1,
  `created_by` varchar(255) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`option_id`),
  UNIQUE KEY `option_slug` (`option_slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `options`
--

LOCK TABLES `options` WRITE;
/*!40000 ALTER TABLE `options` DISABLE KEYS */;
/*!40000 ALTER TABLE `options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_contacts`
--

DROP TABLE IF EXISTS `user_contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_contacts` (
  `userId` varchar(255) NOT NULL,
  `contactId` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`userId`,`contactId`),
  KEY `fk_contact` (`contactId`),
  CONSTRAINT `fk_contact` FOREIGN KEY (`contactId`) REFERENCES `dbusers` (`userId`) ON DELETE CASCADE,
  CONSTRAINT `fk_user` FOREIGN KEY (`userId`) REFERENCES `dbusers` (`userId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_contacts`
--

LOCK TABLES `user_contacts` WRITE;
/*!40000 ALTER TABLE `user_contacts` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_text`
--

DROP TABLE IF EXISTS `user_text`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_text` (
  `ut_id` varchar(255) NOT NULL,
  `msg_from` varchar(255) DEFAULT NULL,
  `view_from` varchar(255) DEFAULT NULL,
  `userfrom` varchar(255) DEFAULT NULL,
  `userto` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `type_id` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `desc` text DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`ut_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `user_data`;

CREATE TABLE `user_data` (
  `_id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `name` VARCHAR(100),
  `google_id` VARCHAR(255) UNIQUE,
  `email` VARCHAR(100),
  `userName` VARCHAR(100),
  `image_url` VARCHAR(255),
  `organization_ids` JSON DEFAULT (JSON_ARRAY()),
  `otp` VARCHAR(255),
  `otpExpiresAt` DATETIME,
  `password` VARCHAR(100),
  `is_active` BOOLEAN DEFAULT TRUE,
  `createdby` CHAR(36),
  `updatedby` CHAR(36),
  `owner` BOOLEAN DEFAULT FALSE,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createddate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updateddate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `parent_id` CHAR(36),
  `organization_id` CHAR(36),
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS chats;

CREATE TABLE chats (
    id CHAR(36) NOT NULL PRIMARY KEY, -- UUID v4
    sender CHAR(36) NOT NULL,         -- FK ke user_data._id
    receiver CHAR(36) NOT NULL,       -- FK ke user_data._id
    message TEXT NULL,
    file_path VARCHAR(255) NULL,
    file_type ENUM('text', 'image', 'voice') NOT NULL DEFAULT 'text',
	read_status ENUM('sent','delivered','seen') DEFAULT 'sent',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_chats_sender FOREIGN KEY (sender) REFERENCES user_data(_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_chats_receiver FOREIGN KEY (receiver) REFERENCES user_data(_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS fcm_tokens;

CREATE TABLE fcm_tokens (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL, 
    token VARCHAR(255) NOT NULL,
    device VARCHAR(100),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, token),
    PRIMARY KEY (id),
	CONSTRAINT fk_fcm_tokens_user_id FOREIGN KEY (user_id) REFERENCES user_data(_id) ON DELETE CASCADE ON UPDATE CASCADE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Dumping data for table `user_text`
--

LOCK TABLES `user_text` WRITE;
/*!40000 ALTER TABLE `user_text` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_text` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'j3xk4y7qamososd7'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2025-07-19  7:09:40
