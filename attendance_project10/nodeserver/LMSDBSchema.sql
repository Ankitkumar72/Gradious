CREATE SCHEMA lmsdb;
use lmsdb;

CREATE TABLE `batch` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `description` varchar(200) DEFAULT NULL,
  `startdate` date DEFAULT NULL,
  `enddate` date DEFAULT NULL,
  `status` char(1) DEFAULT NULL,
  `thumbnail` mediumtext,
  `createddate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `createdby` varchar(20) DEFAULT NULL,
  `modifieddate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedby` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB;


CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstname` varchar(100) NOT NULL,
  `lastname` varchar(100) NOT NULL,
  `lastlogin` datetime DEFAULT NULL,
  `status` int DEFAULT '1',
  `email` varchar(50) DEFAULT NULL,
  `mobile` varchar(13) DEFAULT NULL,
  `college` varchar(100) DEFAULT  NULL,
  `branch` varchar(50) DEFAULT NULL,
  `role` varchar(15) DEFAULT NULL,
  `remarks` mediumtext,
  `createddate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `createdby` varchar(20) DEFAULT NULL,
  `modifieddate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedby` varchar(20) DEFAULT NULL,
  `sessiontoken` varchar(1000) DEFAULT NULL,
  `registered` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB;

CREATE TABLE `batchuser` (
  `batchid` int NOT NULL,
  `userid` int NOT NULL,
  PRIMARY KEY (`batchid`,`userid`),
  KEY `fk_userid` (`userid`),
  CONSTRAINT `fk_batchid` FOREIGN KEY (`batchid`) REFERENCES `batch` (`id`),
  CONSTRAINT `fk_userid` FOREIGN KEY (`userid`) REFERENCES `user` (`id`)
) ENGINE=InnoDB;



INSERT INTO `user` (`id`, `firstname`, `lastname`, `lastlogin`, `status`, `email`, `role`, `createddate`, `modifieddate`) VALUES ('1', 'test', 'c', '2022-12-02 14:00:39', '1', 'test@gradious.com', 'admin', '2022-12-02 08:19:20', '2022-12-02 08:19:20');

CREATE TABLE `session` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mode` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `organized_by` varchar(50) DEFAULT NULL,
  `expiry_time` int NOT NULL,
  `startdate` timestamp DEFAULT NULL,
  `status` char(1) DEFAULT NULL,
  `createddate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `createdby` varchar(20) DEFAULT NULL,
  `modifieddate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedby` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB; 

CREATE TABLE `session_invitees` (
  `sessionid` int NOT NULL,
  `userid` int NOT NULL,
  `status` char(1) DEFAULT NULL,
  `comments` varchar(100) DEFAULT NULL,
  joining_time timestamp DEFAULT NULL,
  leaving_time timestamp DEFAULT NULL,
  duration INT DEFAULT NULL,	
  `createddate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `createdby` varchar(20) DEFAULT NULL,
  `modifieddate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedby` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`sessionid`,`userid`),
  KEY `fk_userid` (`userid`),
  CONSTRAINT `fk_sessionid` FOREIGN KEY (`sessionid`) REFERENCES `session` (`id`),
  CONSTRAINT `fk_sessionuserid` FOREIGN KEY (`userid`) REFERENCES `user` (`id`)
) ENGINE=InnoDB;
