-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jun 06, 2026 at 10:59 PM
-- Server version: 8.0.46-0ubuntu0.24.04.2
-- PHP Version: 8.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mergestars`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `personal_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` int NOT NULL DEFAULT '1',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `personal_id`, `email_verified_at`, `password`, `role`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Giorgi Revazishvili', 'mergestars01@gmail.com', '61001034324', NULL, '$2y$12$..OOUvGVEEzSy9/aw2sHpe1ZJPmKXNQobXfUBqPLwJ5PUAhCLu7ge', 0, NULL, '2026-01-31 10:43:00', '2026-01-31 10:43:00'),
(2, 'Giorgi Molashvili', 'giorgimolashvili87@gmail.com', '01010004790', NULL, '$2y$12$cY.mDdCXpn.TE/BV2cIgruwZiQrNIeSNv9vl6.IYn4baq.s3/.SPy', 1, NULL, '2026-01-31 15:40:23', '2026-01-31 15:40:23'),
(3, 'Giorgi', 'tarasa858@gmail.com', '01001027686', NULL, '$2y$12$p7TOooL74fcC.gZjzPY7gOZESxJ20UzW2v3xcTqBk6AezEHHYWK/S', 1, NULL, '2026-02-01 10:16:46', '2026-02-01 10:16:46'),
(4, 'rostom khundadze', 'rostom@khundadze.com', '61001087646', '2026-02-01 15:40:33', '$2y$12$Zn/k7TChE26HIQoNxuTbG.8da5.0HUPfqtiQjEe/T406AOu0lVDFO', 1, NULL, '2026-02-01 15:40:14', '2026-02-01 15:40:33'),
(5, 'DAVIT DIASAMIDZE', 'dato.diasamidze0914@gmai.com', '61006028052', '2026-02-01 18:29:10', '$2y$12$kuf/u0myQhD46s3s1Lmns.8kRFdIBEegARHYHy6D89FxQFKqVX/um', 1, NULL, '2026-02-01 18:21:41', '2026-02-01 18:29:10'),
(6, 'Saba Revazishvili', 'paradonxparadonx123@gmail.com', '61001072433', NULL, '$2y$12$SviVSRh3nZnxbk1hsC84julktNmdSSPbPrVP.Tss.aUo6Qvu0tmz2', 1, NULL, '2026-02-02 13:16:03', '2026-02-02 13:16:03'),
(7, 'Anri', 'anrivarshanidze2407@gmail.com', '123123123', '2026-02-07 11:32:52', '$2y$12$plHcxkCOJzh8vqKp/8QLnOx7ZyUvbcVP/lTuG3wBZG9kzpgUG2zii', 0, 'yBgQ5vKZlunF8deATcFvpmuVnyEazOW6KOfprYl8GR7HFnArWKwxE5Xr173f', '2026-02-07 11:31:59', '2026-03-04 12:53:03'),
(8, 'vakhtang', 'vakhtangalibegashvili8@gmail.com', '31001036119', NULL, '$2y$12$2n5jbcT9e7Q08UivZSkvS./h4PxjV2dLOtvfZhgQ1cFCmIolf81cO', 1, NULL, '2026-02-08 15:02:01', '2026-02-08 15:02:01'),
(9, 'Kaxa', 'yaska777@gmail.com', '61001060151', NULL, '$2y$12$igesVJgsRdN1hkTzVwl4leZzb95M21jUn3dEvxcNYiElg9ouhXCaW', 1, NULL, '2026-02-08 15:51:24', '2026-02-08 15:51:24'),
(10, 'ნოდარ', 'nodarx@gmail.com', '61001065934', NULL, '$2y$12$TsLIrVZyGNsYpBihsxwAre4MxUS592aupTppNd6jzkrKbxP5txdta', 1, NULL, '2026-02-08 16:11:51', '2026-02-08 16:11:51'),
(11, 'ბექა', 'beqayurshubadze41@gmail.com', '61001077655', NULL, '$2y$12$Cvr.yaSlsE6ZmJiFw163reo5YKsHaRR2aft.SuWyyHfQzoZhGu2X2', 1, 'FMELRidO5oMLPc5PYWFAtuuzpMpNPkkUGXv8mobNMomxRQ9MVLkK7ChYKg0z', '2026-02-08 16:18:18', '2026-03-06 10:06:24'),
(12, 'Achiko Devadze', 'devadze.archil@mail.ru', '61001032526', NULL, '$2y$12$ICADcuIZhxmmVd4IeCOS.eMn0mY35iJRvmr.4RBwTwbt9eukGrJV6', 1, NULL, '2026-02-08 16:24:11', '2026-02-08 16:24:11'),
(13, 'ირაკლი აბესაძე', 'kiki659956@gmail.com', '61003007387', NULL, '$2y$12$qVjiGbkL/lEyXjDaKQx66OIohD1IKa6hcORdn2kUKDvH7iU/FWfna', 1, NULL, '2026-02-08 16:41:49', '2026-02-08 16:41:49'),
(14, 'Avtandil', 'example@domain.com', '61001067782', '2026-02-08 17:17:24', '$2y$12$GYrmT5TgWX0jOfbJdyWWVuu.BY4lkGdImfKI5SKEHGluDvAJXLUdG', 1, NULL, '2026-02-08 17:17:05', '2026-02-08 17:17:24'),
(15, 'დავით', 'kunchu.odzelashvili@gmail.com', '61001038388', NULL, '$2y$12$LPVjtc3gMuH7uNNRLIun4OoMG1pckopf3vMwhEoNVj/EOml0gq5L.', 1, NULL, '2026-02-09 10:52:20', '2026-02-09 10:52:20'),
(16, 'აჩიკო ფილიშვილი', 'achikopilishvili@gmail.com', '01611105842', NULL, '$2y$12$QXXgzBzZ0KErL10U8yMIBO23N6TmXV8yGzw8TSs17Kv9jRNSWGuwu', 1, NULL, '2026-02-09 11:01:59', '2026-02-09 11:01:59'),
(17, 'ელენე სალვარიდი', 'elene.salvaridi@gmail.com', '61003007502', '2026-02-10 13:05:51', '$2y$12$.RCBS1xvn5KMVPMJzKOi1.NGp9knePAxi8VQC0WMUIoPr2CjrsYlO', 1, NULL, '2026-02-10 13:04:02', '2026-02-10 13:05:51'),
(18, 'თამარ', 'tabagua.tamuna@gmail.com', '61001029448', NULL, '$2y$12$k50FHHi8Hpffp4InWaUPsOjA46SBUkto7nekBCSn.7s2EiHx9TkYG', 1, NULL, '2026-02-11 16:07:05', '2026-02-11 16:07:05'),
(19, 'ლადო ანთაძე', 'guguwi21@gmail.com', '61002015518', NULL, '$2y$12$1ZfI0xhTwPO/KPj0KxyPZOGTcb2o93qP6GfHNtJ9nRRxi8StoAPkO', 1, NULL, '2026-02-11 21:08:25', '2026-02-11 21:08:25'),
(20, 'Irakli abashidze', 'irakliabashidze033@gmail.com', '61004021683', NULL, '$2y$12$S1ib3kWmTDJAsEwk1yO1l.SV.1ihbw3RopO6wlZ2jV6uF58dK.unu', 1, NULL, '2026-02-14 00:34:49', '2026-02-14 00:34:49'),
(21, 'ქეთევან ნოზაძე', 'irmanozadze1958@gmail.com', '42001001387', NULL, '$2y$12$MVbPd6E2.7o5GiQfLD4WzOrCi90ZGy0aqrNBrRxqoEJX4KBDGqIju', 1, NULL, '2026-02-14 16:12:44', '2026-02-14 16:12:44'),
(22, 'Davit tedoradze', 'tedoradze2022@bk.ru', '61106085036', NULL, '$2y$12$DZ16782JYNZjVRqO7S8Q6.H9WlEnWPSUUQFznnHQTxYLl73OMdYfC', 1, NULL, '2026-02-20 20:10:45', '2026-02-20 20:10:45'),
(23, 'Dachi', 'd.diasamidze00@gmail.com', '01411109738', NULL, '$2y$12$9AyNeqGalQFzOyqHhV0yDOcVR4eQUgVd2nFUJr41bsxxnKB5CAVJm', 1, NULL, '2026-03-15 15:13:50', '2026-03-15 15:13:50'),
(24, 'Tariel diasamidze', 'tdiasamidze284@gmail.com', '61001055926', NULL, '$2y$12$vGnMj4XP2Ardwn.wCjaME.7msQ4HWRUpMPdrrB1JOm58o3a7os6jq', 1, NULL, '2026-05-21 09:30:39', '2026-05-21 09:30:39'),
(25, 'Temo Tavdgiridze', 'temotavdgiridze1226@gmail.com', '61910021978', NULL, '$2y$12$varl5GSV1WF1mVptVarxqOP7PJBx61OCyxYECfuLGFLfNWiWDBKzK', 1, NULL, '2026-05-30 19:34:59', '2026-05-30 19:34:59');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_personal_id_unique` (`personal_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
