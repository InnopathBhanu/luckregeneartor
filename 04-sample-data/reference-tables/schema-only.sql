-- MySQL dump 10.13  Distrib 8.0.42, for Linux (x86_64)
--
-- Host: localhost    Database: luckydb
-- ------------------------------------------------------
-- Server version	8.0.42-0ubuntu0.20.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ad_counter_table`
--

DROP TABLE IF EXISTS `ad_counter_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ad_counter_table` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `PAGETYPE` varchar(30) NOT NULL,
  `DATE` date NOT NULL,
  `ADROUTECNTR` bigint NOT NULL,
  `ADSPROVIDR` varchar(30) NOT NULL,
  `CREATEDTIME` datetime NOT NULL,
  `UPDATEDTIME` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`)
) ENGINE=MyISAM AUTO_INCREMENT=1540 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `admin_user`
--

DROP TABLE IF EXISTS `admin_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_user` (
  `USER_ID` int NOT NULL,
  `USER_NAME` varchar(50) NOT NULL,
  `PASSWORD` varchar(50) DEFAULT NULL,
  `ROLE` varchar(50) DEFAULT NULL,
  `UPDATED_TIME` datetime DEFAULT NULL,
  `CREATED_TIME` datetime DEFAULT NULL,
  PRIMARY KEY (`USER_ID`,`USER_NAME`),
  UNIQUE KEY `USER_NAME` (`USER_NAME`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `affliate_properties`
--

DROP TABLE IF EXISTS `affliate_properties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `affliate_properties` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `GAME_AFFLIATE_ID` varchar(50) NOT NULL,
  `AFFLIATE_URL_CODE` varchar(50) DEFAULT NULL,
  `AFFLIATE_VALUE` varchar(250) DEFAULT NULL,
  `CREATED_DATE` datetime DEFAULT NULL,
  `LAST_UPDATED_DATE` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`,`GAME_AFFLIATE_ID`),
  UNIQUE KEY `GAME_AFFLIATE_ID` (`GAME_AFFLIATE_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `application_properties`
--

DROP TABLE IF EXISTS `application_properties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `application_properties` (
  `ID` int NOT NULL,
  `PROPERTY_NAME` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `PROPERTY_VALUE` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CREATED_DATE` datetime DEFAULT NULL,
  `LAST_UPDATED_DATE` datetime DEFAULT NULL,
  `LAST_UPDATED_BY` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ID`,`PROPERTY_NAME`),
  UNIQUE KEY `PROPERTY_NAME` (`PROPERTY_NAME`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `blog_entry`
--

DROP TABLE IF EXISTS `blog_entry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blog_entry` (
  `BLOG_ID` varchar(50) NOT NULL DEFAULT '',
  `TITLE` varchar(1000) DEFAULT NULL,
  `SUB_TITLE` varchar(1000) DEFAULT NULL,
  `IMAGE_NAME` varchar(1000) DEFAULT NULL,
  `IMAGE_CREDIT` varchar(500) DEFAULT NULL,
  `ORIGINAL_PERMALINK` varchar(1000) DEFAULT NULL,
  `EXCERPT` varchar(1000) DEFAULT NULL,
  `BODY` text,
  `DATE_PUBLISHED` datetime DEFAULT NULL,
  `DATE_UPDATED` datetime DEFAULT NULL,
  `TARGED_LOCATIONS` varchar(500) DEFAULT NULL,
  `RESTRICTED_LOCATIONS` varchar(500) DEFAULT NULL,
  `STATUS` varchar(50) DEFAULT NULL,
  `AUTHOR` varchar(150) DEFAULT NULL,
  `COMMENTS_ENABLED` tinyint(1) DEFAULT NULL,
  `TAGS` varchar(1000) DEFAULT NULL,
  `VIEWS_COUNT` int DEFAULT NULL,
  `CATEGORY` int DEFAULT NULL,
  PRIMARY KEY (`BLOG_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bonus_numbers_info`
--

DROP TABLE IF EXISTS `bonus_numbers_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bonus_numbers_info` (
  `id` int NOT NULL,
  `GAME_ID` int NOT NULL,
  `ORDER_ID` smallint NOT NULL,
  `BALL_TYPE` varchar(100) NOT NULL,
  `BALL_NAME` varchar(100) NOT NULL,
  `NUM_OF_BALLS` int NOT NULL,
  `MIN` int NOT NULL,
  `MAX` int NOT NULL,
  `required` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `different_set` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `BONUS_INFO` varchar(300) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQUE_NUMBER_INFO` (`GAME_ID`,`ORDER_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `class101`
--

DROP TABLE IF EXISTS `class101`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class101` (
  `id` int DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `gpa` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contact_us_info`
--

DROP TABLE IF EXISTS `contact_us_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_us_info` (
  `ID` int NOT NULL,
  `CUSTOMER_NAME` varchar(30) DEFAULT NULL,
  `CUSTOMER_EMAIL` varchar(30) DEFAULT NULL,
  `REASON` varchar(20) DEFAULT NULL,
  `COMMENT` varchar(1000) DEFAULT NULL,
  `ADDED_TIME` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `event_result`
--

DROP TABLE IF EXISTS `event_result`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_result` (
  `EVENT_ID` bigint NOT NULL,
  `ORDER_ID` int NOT NULL DEFAULT '0',
  `DRAWN` smallint NOT NULL,
  PRIMARY KEY (`EVENT_ID`,`ORDER_ID`),
  KEY `FK638E6182AA485FAF` (`EVENT_ID`),
  CONSTRAINT `FK638E6182AA485FAF` FOREIGN KEY (`EVENT_ID`) REFERENCES `game_result` (`EVENT_ID`),
  CONSTRAINT `FK93o5kbedxldg8mrx0v5e3tp6q` FOREIGN KEY (`EVENT_ID`) REFERENCES `game_result` (`EVENT_ID`),
  CONSTRAINT `FK_EVENT_RESULT_EVENT_ID` FOREIGN KEY (`EVENT_ID`) REFERENCES `game_result` (`EVENT_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `favourite_game`
--

DROP TABLE IF EXISTS `favourite_game`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favourite_game` (
  `GAME_ID` int NOT NULL,
  `USER_ID` int NOT NULL,
  PRIMARY KEY (`GAME_ID`,`USER_ID`),
  KEY `FKajvuouc6x2unlubpu1py3hy7n` (`USER_ID`),
  CONSTRAINT `FK_game_user` FOREIGN KEY (`GAME_ID`) REFERENCES `game` (`ID`),
  CONSTRAINT `FK_user_game` FOREIGN KEY (`USER_ID`) REFERENCES `insider_user` (`INSIDER_ID`),
  CONSTRAINT `FKajvuouc6x2unlubpu1py3hy7n` FOREIGN KEY (`USER_ID`) REFERENCES `insider_user` (`INSIDER_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `game`
--

DROP TABLE IF EXISTS `game`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `game` (
  `ID` int NOT NULL,
  `NAME` varchar(50) DEFAULT NULL,
  `UNIQUE_NAME` varchar(50) NOT NULL,
  `GAMETIME` varchar(10) DEFAULT NULL,
  `TIMEZONE` varchar(20) NOT NULL,
  `STDTIME` varchar(10) NOT NULL,
  `HOWTOPLAY` varchar(500) DEFAULT NULL,
  `PLAY_TYPE` varchar(30) DEFAULT NULL,
  `TOP_PRIZE` varchar(100) DEFAULT NULL,
  `TOP_PRIZE_ODDS` varchar(30) DEFAULT NULL,
  `PRIZE_ROLLOVER` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PRIZE_PERI_MUTUAL` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `INFO_URL` varchar(200) DEFAULT NULL,
  `INFO` longtext,
  `IS_MULTI_STATE` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `IS_MULTI_COUNTRY` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Status` varchar(6) DEFAULT NULL,
  `PRIZE_MATRIX` longtext,
  `isCardGame` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `NUM_OF_BALLS` varchar(5) DEFAULT NULL,
  `DIS_GAME_TYPE` varchar(50) DEFAULT NULL,
  `TINBU_GAME_ID` varchar(50) DEFAULT NULL,
  `isJackpot` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `isPayout` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `HIGHEST_JACKPOT` varchar(50) DEFAULT NULL,
  `HIGHEST_JACKPOT_DATE` datetime DEFAULT NULL,
  `TICKET_PRICE` varchar(255) DEFAULT NULL,
  `ADVANCED_PLAYS` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `CUTOFFTIME` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `game_daysoff`
--

DROP TABLE IF EXISTS `game_daysoff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `game_daysoff` (
  `GAME_ID` int NOT NULL,
  `OFF_DAY` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`GAME_ID`,`OFF_DAY`),
  KEY `FK6E8EAE4BD33369B2` (`GAME_ID`),
  CONSTRAINT `FK55w8l64abrhk8vedeww40gerd` FOREIGN KEY (`GAME_ID`) REFERENCES `game` (`ID`),
  CONSTRAINT `FK6E8EAE4BD33369B2` FOREIGN KEY (`GAME_ID`) REFERENCES `game` (`ID`),
  CONSTRAINT `FK_GAME` FOREIGN KEY (`GAME_ID`) REFERENCES `game` (`ID`),
  CONSTRAINT `fk_game_daysoff_game` FOREIGN KEY (`GAME_ID`) REFERENCES `game` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `game_result`
--

DROP TABLE IF EXISTS `game_result`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `game_result` (
  `EVENT_ID` bigint NOT NULL,
  `GAME_ID` int NOT NULL,
  `DRAW_TIME` datetime NOT NULL,
  `READ_TIME` datetime NOT NULL,
  `PRIZE` varchar(20) DEFAULT NULL,
  `info` varchar(50) DEFAULT NULL,
  `JACKPOT_CASH_VALUE` varchar(50) DEFAULT NULL,
  `payout_xml` varchar(5000) DEFAULT NULL,
  PRIMARY KEY (`EVENT_ID`),
  UNIQUE KEY `GAME_DRAW_DT` (`EVENT_ID`),
  KEY `FK_GAME_RESULT_GAMEID` (`GAME_ID`),
  CONSTRAINT `FK_GAME_RESULT_GAMEID` FOREIGN KEY (`GAME_ID`) REFERENCES `game` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `game_result_tracker`
--

DROP TABLE IF EXISTS `game_result_tracker`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `game_result_tracker` (
  `GAME_ID` int NOT NULL,
  `DRAW_TIME` datetime NOT NULL,
  `READ_TIME` datetime NOT NULL,
  `NEXT_DRAW_TIME` datetime NOT NULL,
  `FIRST_DRAW_TIME` datetime DEFAULT NULL,
  `NEXT_JACKPOT` varchar(50) DEFAULT NULL,
  `LAST_UPDATED_TIME` datetime DEFAULT NULL,
  `PRIZE_UPDATED_TIME` datetime DEFAULT NULL,
  `TINBU_LAST_UPDATED_TIME` datetime DEFAULT NULL,
  `JACKPOT_CHANGE` bigint DEFAULT NULL,
  `NEXT_JACKPOT_CASH_VALUE` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`GAME_ID`),
  CONSTRAINT `FK_GAME_RESULT_TRACKER_GAMEID` FOREIGN KEY (`GAME_ID`) REFERENCES `game` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `game_result_tracker_audit`
--

DROP TABLE IF EXISTS `game_result_tracker_audit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `game_result_tracker_audit` (
  `AUDIT_ID` int NOT NULL AUTO_INCREMENT,
  `GAME_ID` int NOT NULL,
  `DRAW_TIME` datetime NOT NULL,
  `READ_TIME` datetime NOT NULL,
  `NEXT_DRAW_TIME` datetime NOT NULL,
  `NOTE` varchar(40) DEFAULT NULL,
  `TINBU_LAST_UPDATED_TIME` datetime DEFAULT NULL,
  `LAST_UPDATED_TIME` datetime DEFAULT NULL,
  `NEXT_JACKPOT` varchar(50) DEFAULT NULL,
  `PRIZE` varchar(50) DEFAULT NULL,
  `RESULTS` varchar(150) DEFAULT NULL,
  `NEXT_JACKPOT_CASH_VALUE` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`AUDIT_ID`),
  KEY `FK_GAME_RESULT_TRACKER_AUDIT_GAMEID` (`GAME_ID`),
  CONSTRAINT `FK_GAME_RESULT_TRACKER_AUDIT_GAMEID` FOREIGN KEY (`GAME_ID`) REFERENCES `game` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1494319 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `game_system`
--

DROP TABLE IF EXISTS `game_system`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `game_system` (
  `GAME_ID` int NOT NULL,
  `LUCKY_SYSTEM` varchar(50) NOT NULL,
  PRIMARY KEY (`GAME_ID`,`LUCKY_SYSTEM`),
  KEY `FK_GAME_SYSTEM_SYSTEM` (`LUCKY_SYSTEM`),
  CONSTRAINT `FK_GAME_SYSTEM_SYSTEM` FOREIGN KEY (`LUCKY_SYSTEM`) REFERENCES `lucky_numbers_system` (`LUCKY_SYSTEM`),
  CONSTRAINT `FK_USER_GAME_ID_SYSTEM` FOREIGN KEY (`GAME_ID`) REFERENCES `game` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `insider_subscription`
--

DROP TABLE IF EXISTS `insider_subscription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `insider_subscription` (
  `INSIDER_ID` int NOT NULL,
  `subscription_id` int NOT NULL,
  `STATUS` varchar(50) DEFAULT NULL,
  `created_date` datetime DEFAULT NULL,
  `LAST_UPDATED` datetime DEFAULT NULL,
  PRIMARY KEY (`INSIDER_ID`,`subscription_id`),
  KEY `subscription_id` (`subscription_id`),
  CONSTRAINT `insider_subscription_ibfk_1` FOREIGN KEY (`INSIDER_ID`) REFERENCES `insider_user` (`INSIDER_ID`),
  CONSTRAINT `insider_subscription_ibfk_2` FOREIGN KEY (`subscription_id`) REFERENCES `subscription_definition` (`subscription_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `insider_user`
--

DROP TABLE IF EXISTS `insider_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `insider_user` (
  `INSIDER_ID` int NOT NULL,
  `EMAIL` varchar(50) NOT NULL,
  `UNIQUE_EMAILID` varchar(50) NOT NULL,
  `FIRST_NAME` varchar(50) NOT NULL,
  `LAST_NAME` varchar(50) NOT NULL,
  `PASS_WORD` varchar(50) NOT NULL,
  `UPDATED_TIME` datetime NOT NULL,
  `EXPIRE_DATE` date NOT NULL,
  `MEMO` varchar(500) DEFAULT NULL,
  `DEFAULT_STATE` varchar(2) DEFAULT NULL,
  `CREATED_TIME` datetime NOT NULL,
  `signup_location` varchar(50) DEFAULT NULL,
  `signup_ip` varchar(50) DEFAULT NULL,
  `LAST_LOGINDATE` datetime DEFAULT NULL,
  `IS_VERIFIED` int DEFAULT NULL,
  `ACCESS` varchar(255) DEFAULT NULL,
  `DOB` datetime DEFAULT NULL,
  PRIMARY KEY (`INSIDER_ID`),
  UNIQUE KEY `EMAIL` (`EMAIL`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `insider_user_audit`
--

DROP TABLE IF EXISTS `insider_user_audit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `insider_user_audit` (
  `INSIDER_ID` int NOT NULL,
  `EMAIL` varchar(50) NOT NULL,
  `FIRST_NAME` varchar(50) NOT NULL,
  `LAST_NAME` varchar(50) NOT NULL,
  `PASS_WORD` varchar(50) NOT NULL,
  `UPDATED_TIME` datetime NOT NULL,
  `EXPIRE_DATE` date NOT NULL,
  `MEMO` varchar(500) DEFAULT NULL,
  `DEFAULT_STATE` varchar(2) DEFAULT NULL,
  `ACT` varchar(500) DEFAULT NULL,
  `CREATED_TIME` datetime NOT NULL,
  `INSIDER_AUDIT_ID` int DEFAULT NULL,
  PRIMARY KEY (`INSIDER_ID`,`UPDATED_TIME`),
  CONSTRAINT `FK_USER_ID_AUDIT` FOREIGN KEY (`INSIDER_ID`) REFERENCES `insider_user` (`INSIDER_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lucky_numbers`
--

DROP TABLE IF EXISTS `lucky_numbers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lucky_numbers` (
  `LUCKY_NUMBERS_ID` varchar(50) NOT NULL,
  `CREATED_TIME` datetime NOT NULL,
  `UPDATED_TIME` datetime NOT NULL,
  `INFO` varchar(500) DEFAULT NULL,
  `LUCKY_SYSTEM` varchar(50) NOT NULL,
  PRIMARY KEY (`LUCKY_NUMBERS_ID`),
  KEY `FK_LUCKY_NUMBERS_SYSTEM` (`LUCKY_SYSTEM`),
  CONSTRAINT `FK_LUCKY_NUMBERS_SYSTEM` FOREIGN KEY (`LUCKY_SYSTEM`) REFERENCES `lucky_numbers_system` (`LUCKY_SYSTEM`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lucky_numbers_list`
--

DROP TABLE IF EXISTS `lucky_numbers_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lucky_numbers_list` (
  `LUCKY_NUMBERS_ID` varchar(50) NOT NULL,
  `ORDER_ID` int NOT NULL DEFAULT '0',
  `NUMBER` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`LUCKY_NUMBERS_ID`,`ORDER_ID`),
  KEY `FK89219DAA9BEAE7A8` (`LUCKY_NUMBERS_ID`),
  CONSTRAINT `FK44p7syctesukp4qu7kdbrkxof` FOREIGN KEY (`LUCKY_NUMBERS_ID`) REFERENCES `lucky_numbers` (`LUCKY_NUMBERS_ID`),
  CONSTRAINT `FK89219DAA9BEAE7A8` FOREIGN KEY (`LUCKY_NUMBERS_ID`) REFERENCES `lucky_numbers` (`LUCKY_NUMBERS_ID`),
  CONSTRAINT `FK_LUCKY_NUMBERS_LIST_ID` FOREIGN KEY (`LUCKY_NUMBERS_ID`) REFERENCES `lucky_numbers` (`LUCKY_NUMBERS_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lucky_numbers_match`
--

DROP TABLE IF EXISTS `lucky_numbers_match`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lucky_numbers_match` (
  `LUCKY_NUMBERS_ID` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ORDER_ID` int NOT NULL,
  `RESULT` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`LUCKY_NUMBERS_ID`,`ORDER_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lucky_numbers_system`
--

DROP TABLE IF EXISTS `lucky_numbers_system`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lucky_numbers_system` (
  `LUCKY_SYSTEM` varchar(50) NOT NULL,
  `CREATED_TIME` datetime NOT NULL,
  `UPDATED_TIME` datetime NOT NULL,
  `INFO` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`LUCKY_SYSTEM`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lucky_numbers_tracker`
--

DROP TABLE IF EXISTS `lucky_numbers_tracker`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lucky_numbers_tracker` (
  `GAME_ID` int NOT NULL,
  `GENERATED_TIME` datetime NOT NULL,
  `DRAW_TIME` datetime NOT NULL,
  `UPDATED_TIME` datetime NOT NULL,
  `LUCKY_NUMBERS_ID` varchar(50) DEFAULT NULL,
  `RESULT` varchar(50) DEFAULT NULL,
  `PRIZE` varchar(50) DEFAULT NULL,
  `DRAWN` varchar(50) DEFAULT NULL,
  `LUCKY_SYSTEM` varchar(50) NOT NULL,
  PRIMARY KEY (`GAME_ID`,`DRAW_TIME`,`LUCKY_SYSTEM`),
  KEY `FK_LUCKY_NUM_TARCKER_LUCKY_NUM` (`LUCKY_NUMBERS_ID`),
  KEY `FK_LUCKY_NUMBERS_TRACKER_SYSTEM` (`LUCKY_SYSTEM`),
  CONSTRAINT `FK_LUCKY_NUM_TARCKER_LUCKY_NUM` FOREIGN KEY (`LUCKY_NUMBERS_ID`) REFERENCES `lucky_numbers` (`LUCKY_NUMBERS_ID`),
  CONSTRAINT `FK_LUCKY_NUMBERS_TRACKER_SYSTEM` FOREIGN KEY (`LUCKY_SYSTEM`) REFERENCES `lucky_numbers_system` (`LUCKY_SYSTEM`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `news_entry`
--

DROP TABLE IF EXISTS `news_entry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `news_entry` (
  `NEWS_ID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `TITLE` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `SUB_TITLE` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `STATE` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `IMAGE_NAME` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `IMAGE_CREDIT` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ORIGINAL_PERMALINK` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `EXCERPT` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `BODY` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `DATE_PUBLISHED` datetime DEFAULT NULL,
  `DATE_UPDATED` datetime DEFAULT NULL,
  `TARGED_LOCATIONS` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `RESTRICTED_LOCATIONS` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `STATUS` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `AUTHOR` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `COMMENTS_ENABLED` tinyint(1) DEFAULT NULL,
  `TAGS` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `VIEWS_COUNT` int DEFAULT NULL,
  `CATEGORY` int DEFAULT NULL,
  PRIMARY KEY (`NEWS_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `note_entry`
--

DROP TABLE IF EXISTS `note_entry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `note_entry` (
  `NOTE_ID` int NOT NULL AUTO_INCREMENT,
  `APPLIED_TO` varchar(255) DEFAULT NULL,
  `STATUS` varchar(255) DEFAULT NULL,
  `TEXT` varchar(5000) DEFAULT NULL,
  `TYPE` varchar(255) DEFAULT NULL,
  `VALID_TILL_DATE` date NOT NULL,
  PRIMARY KEY (`NOTE_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1005 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `page_properties`
--

DROP TABLE IF EXISTS `page_properties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `page_properties` (
  `id` int NOT NULL,
  `page_name` varchar(60) NOT NULL,
  `prop_name` varchar(60) NOT NULL,
  `prop_val` varchar(60) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `page_properties_un` (`page_name`,`prop_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pepper`
--

DROP TABLE IF EXISTS `pepper`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pepper` (
  `INSIDER_ID` int NOT NULL DEFAULT '0',
  `PEPPER` varchar(50) NOT NULL,
  PRIMARY KEY (`INSIDER_ID`),
  CONSTRAINT `FK_USER_PEPPER` FOREIGN KEY (`INSIDER_ID`) REFERENCES `insider_user` (`INSIDER_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reset_id`
--

DROP TABLE IF EXISTS `reset_id`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reset_id` (
  `INSIDER_ID` int NOT NULL,
  `UID` varchar(50) NOT NULL,
  `UID_EXPIRE_DATE` datetime NOT NULL,
  PRIMARY KEY (`UID`),
  KEY `FK_USER_RESET_ID` (`INSIDER_ID`),
  CONSTRAINT `FK_USER_RESET_ID` FOREIGN KEY (`INSIDER_ID`) REFERENCES `insider_user` (`INSIDER_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `review_entry`
--

DROP TABLE IF EXISTS `review_entry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_entry` (
  `REVIEW_ID` varchar(50) NOT NULL DEFAULT '',
  `REVIEWER_NAME` varchar(50) DEFAULT NULL,
  `REVIEWED_DATE` datetime DEFAULT NULL,
  `RATING` int DEFAULT NULL,
  `HEADING` varchar(100) DEFAULT NULL,
  `REVIEW_BODY` text,
  `IMAGE_NAME` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`REVIEW_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sales_tracker`
--

DROP TABLE IF EXISTS `sales_tracker`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_tracker` (
  `ID` mediumint NOT NULL,
  `TRACKER_ID` varchar(50) NOT NULL,
  `EMAIL` varchar(50) DEFAULT NULL,
  `CREATED_TIME` datetime NOT NULL,
  `UPDATED_TIME` datetime NOT NULL,
  `RESULT` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `seo_headings`
--

DROP TABLE IF EXISTS `seo_headings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seo_headings` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `META_ID` int NOT NULL,
  `PAGE_URL` varchar(50) NOT NULL,
  `HEADING_TYPE` varchar(50) DEFAULT NULL,
  `HEADING` varchar(50) DEFAULT NULL,
  `TAG_VALUE` varchar(160) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_SEO_META_ID` (`META_ID`),
  CONSTRAINT `FK_SEO_META_ID` FOREIGN KEY (`META_ID`) REFERENCES `seo_meta` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=223 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `seo_headings_list`
--

DROP TABLE IF EXISTS `seo_headings_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seo_headings_list` (
  `PAGE` varchar(50) NOT NULL,
  `HEADING_TYPE` varchar(50) NOT NULL,
  `HEADING` varchar(50) NOT NULL,
  PRIMARY KEY (`PAGE`,`HEADING_TYPE`,`HEADING`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `seo_meta`
--

DROP TABLE IF EXISTS `seo_meta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seo_meta` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `PAGE_URL` varchar(50) NOT NULL,
  `PAGE_TITLE` varchar(160) DEFAULT NULL,
  `META_DESCRIPTION` varchar(300) DEFAULT NULL,
  `META_KEYWORDS` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `H1_TAG` varchar(160) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `PAGE_URL` (`PAGE_URL`)
) ENGINE=InnoDB AUTO_INCREMENT=261 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `state_game`
--

DROP TABLE IF EXISTS `state_game`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `state_game` (
  `GAME_ID` int NOT NULL,
  `STATE_ID` int NOT NULL,
  `ORDER_ID` int NOT NULL,
  PRIMARY KEY (`GAME_ID`,`STATE_ID`),
  KEY `FK_STATEID` (`STATE_ID`),
  KEY `FK11164F004BEBADE2` (`STATE_ID`),
  CONSTRAINT `FK11164F004BEBADE2` FOREIGN KEY (`STATE_ID`) REFERENCES `state_info` (`ID`),
  CONSTRAINT `FK_GAMEID` FOREIGN KEY (`GAME_ID`) REFERENCES `game` (`ID`),
  CONSTRAINT `FK_STATEID` FOREIGN KEY (`STATE_ID`) REFERENCES `state_info` (`ID`),
  CONSTRAINT `FKowv3wk1n45uexhel7ba7hggpb` FOREIGN KEY (`STATE_ID`) REFERENCES `state_info` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `state_info`
--

DROP TABLE IF EXISTS `state_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `state_info` (
  `ID` int NOT NULL,
  `NAME` varchar(20) DEFAULT NULL,
  `STATECODE` varchar(2) DEFAULT NULL,
  `STATETIMEZONE` varchar(50) DEFAULT NULL,
  `ONLYMULTISTATE` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ADDR1` varchar(100) DEFAULT NULL,
  `ADDR2` varchar(100) DEFAULT NULL,
  `CITY` varchar(20) DEFAULT NULL,
  `STATE` varchar(20) DEFAULT NULL,
  `ZIP` varchar(12) DEFAULT NULL,
  `COUNTRY` varchar(15) DEFAULT NULL,
  `PHONE` varchar(15) DEFAULT NULL,
  `URL` varchar(50) DEFAULT NULL,
  `EMAIL` varchar(50) DEFAULT NULL,
  `STATE_TEXT` text,
  `KEY_WORDS` varchar(300) DEFAULT NULL,
  `DESCRIPTION` varchar(300) DEFAULT NULL,
  `TAX_RATE` decimal(3,2) DEFAULT NULL,
  `TITLE` varchar(76) DEFAULT NULL,
  `STATE_HISTORY_TEXT` text,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `subscription_definition`
--

DROP TABLE IF EXISTS `subscription_definition`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_definition` (
  `subscription_id` int NOT NULL,
  `subscription_type` varchar(50) NOT NULL,
  `created_date` datetime DEFAULT NULL,
  PRIMARY KEY (`subscription_id`,`subscription_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-08 11:34:05
