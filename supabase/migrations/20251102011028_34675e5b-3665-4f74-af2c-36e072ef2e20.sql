-- Populate official schedule for Kudzani Musarurwa (kudzimusar@gmail.com)
-- User ID: 63908300-f3df-4fff-ab25-cc268e00a45b
-- This migration adds the complete driving school schedule for Nov-Dec 2025

INSERT INTO public.driving_school_schedule (
  user_id, date, time_slot, event_type, lecture_number, 
  custom_label, symbol, location, status, notes
) VALUES
  -- November 2025 events
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-11-17', '14:50-16:20', 'orientation', NULL, 'オリエンテーション', '△★', NULL, 'scheduled', 'First time orientation'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-11-18', '14:50-16:20', 'aptitude', NULL, '適性検査', 'P', NULL, 'scheduled', 'Aptitude test'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-11-20', '14:50-16:20', 'theory', 1, '学科1', 'P', NULL, 'scheduled', 'Theory Lecture 1'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-11-08', '14:50-16:20', 'theory', 6, '学科6', NULL, NULL, 'scheduled', 'Theory Lecture 6'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-11-08', '16:30-18:00', 'theory', 10, '学科10', NULL, NULL, 'scheduled', 'Theory Lecture 10'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-11-09', '14:50-16:20', 'theory', 4, '学科4', NULL, NULL, 'scheduled', 'Theory Lecture 4'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-11-10', '14:50-16:20', 'theory', 5, '学科5', NULL, NULL, 'scheduled', 'Theory Lecture 5'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-11-15', '14:50-16:20', 'theory', 8, '学科8', NULL, NULL, 'scheduled', 'Theory Lecture 8'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-11-15', '16:30-18:00', 'theory', 6, '学科6', NULL, NULL, 'scheduled', 'Theory Lecture 6 (repeat)'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-11-16', '14:50-16:20', 'driving', NULL, 'AT所内', NULL, '校内コース', 'scheduled', 'AT driving on-campus'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-11-22', '14:50-16:20', 'driving', NULL, 'AT所内', NULL, '校内コース', 'scheduled', 'AT driving on-campus'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-11-22', '16:30-18:00', 'theory', 9, '学科9', NULL, NULL, 'scheduled', 'Theory Lecture 9'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-11-23', '14:50-16:20', 'driving', NULL, 'AT所内', NULL, '校内コース', 'scheduled', 'AT driving on-campus'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-11-23', '16:30-18:00', 'driving', NULL, 'AT所内', NULL, '校内コース', 'scheduled', 'AT driving on-campus'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-11-24', '14:50-16:20', 'theory', 3, '学科3', NULL, NULL, 'scheduled', 'Theory Lecture 3'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-11-29', '16:30-18:00', 'driving', NULL, 'AT所内', NULL, '校内コース', 'scheduled', 'AT driving on-campus'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-11-29', '18:30-20:00', 'driving', NULL, 'AT所内', 'P', '校内コース', 'scheduled', 'AT driving on-campus (practical)'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-11-30', '14:50-16:20', 'driving', NULL, 'AT所内', NULL, '校内コース', 'scheduled', 'AT driving on-campus'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-11-30', '16:30-18:00', 'theory', 7, '学科7', NULL, NULL, 'scheduled', 'Theory Lecture 7'),
  
  -- December 2025 events
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-12-06', '14:50-16:20', 'theory', 6, '学科6', NULL, NULL, 'scheduled', 'Theory Lecture 6 (repeat)'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-12-06', '16:30-18:00', 'driving', NULL, 'AT所内', NULL, '校内コース', 'scheduled', 'AT driving on-campus'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-12-06', '18:30-20:00', 'driving', NULL, 'AT所内', 'P', '校内コース', 'scheduled', 'AT driving on-campus (practical)'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-12-07', '14:50-16:20', 'driving', NULL, 'AT所内', NULL, '校内コース', 'scheduled', 'AT driving on-campus'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-12-07', '16:30-18:00', 'driving', NULL, 'AT所内', 'P', '校内コース', 'scheduled', 'AT driving on-campus (practical)'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-12-13', '14:50-16:20', 'driving', NULL, 'AT所内', NULL, '校内コース', 'scheduled', 'AT driving on-campus'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-12-13', '16:30-18:00', 'driving', NULL, 'AT所内', 'P', '校内コース', 'scheduled', 'AT driving on-campus (practical)'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-12-14', '14:50-16:20', 'driving', NULL, 'AT所内', NULL, '校内コース', 'scheduled', 'AT driving on-campus'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-12-14', '16:30-18:00', 'driving', NULL, 'AT所内', 'P', '校内コース', 'scheduled', 'AT driving on-campus (practical)'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-12-20', '14:50-16:20', 'driving', NULL, 'AT所内', 'P', '校内コース', 'scheduled', 'AT driving on-campus (practical)'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-12-20', '16:30-18:00', 'theory', 2, '学科2', NULL, NULL, 'scheduled', 'Theory Lecture 2'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-12-20', '18:30-20:00', 'driving', NULL, 'AT所内', NULL, '校内コース', 'scheduled', 'AT driving on-campus'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-12-27', '14:50-16:20', 'driving', NULL, 'AT所内', NULL, '校内コース', 'scheduled', 'AT driving on-campus'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-12-27', '16:30-18:00', 'test', NULL, '仮免許試験', 'P', NULL, 'scheduled', 'Provisional license test'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-12-27', '18:30-20:00', 'test', NULL, '技能検定', 'P', NULL, 'scheduled', 'Skills test'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-12-28', '14:50-16:20', 'test', NULL, '修了検定', NULL, NULL, 'scheduled', '1st Stage Completion Test'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-12-28', '16:30-18:00', 'test', NULL, '技能検定', NULL, NULL, 'scheduled', 'Driving Test'),
  ('63908300-f3df-4fff-ab25-cc268e00a45b', '2025-12-28', '18:30-20:00', 'test', NULL, '学科試験', NULL, NULL, 'scheduled', 'Written Test - 1st Stage Complete');