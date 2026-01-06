CREATE TABLE `job_events` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`step_key` text,
	`event_type` text NOT NULL,
	`payload` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `job_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`recipe_id` text NOT NULL,
	`config_json` text NOT NULL,
	`created_by` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scene_markers` (
	`id` text PRIMARY KEY NOT NULL,
	`script_version_id` text NOT NULL,
	`scene_number` integer NOT NULL,
	`title` text,
	`start_line` integer,
	`end_line` integer,
	`start_char` integer,
	`end_char` integer,
	`estimated_start_sec` integer,
	`estimated_end_sec` integer,
	`notes` text,
	`color` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `script_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`version` integer NOT NULL,
	`content` text NOT NULL,
	`word_count` integer,
	`character_count` integer,
	`estimated_duration_sec` integer,
	`created_by` text DEFAULT 'ai' NOT NULL,
	`notes` text,
	`is_current` integer DEFAULT false NOT NULL,
	`is_approved` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
ALTER TABLE `artifacts` ADD `is_latest` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `artifacts` ADD `mime_type` text;--> statement-breakpoint
ALTER TABLE `job_steps` ADD `locked_at` text;--> statement-breakpoint
ALTER TABLE `job_steps` ADD `locked_by` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `execution_mode` text DEFAULT 'auto' NOT NULL;--> statement-breakpoint
ALTER TABLE `jobs` ADD `state` text DEFAULT 'DRAFT';--> statement-breakpoint
ALTER TABLE `jobs` ADD `failed_step` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `error_message` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `error_code` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `retry_count` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `jobs` ADD `language` text DEFAULT 'pt-BR';--> statement-breakpoint
ALTER TABLE `jobs` ADD `duration_preset` text DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE `jobs` ADD `story_type` text DEFAULT 'historia_geral';--> statement-breakpoint
ALTER TABLE `jobs` ADD `voice_preset_id` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `visual_mode` text DEFAULT 'automatic';--> statement-breakpoint
ALTER TABLE `jobs` ADD `images_count` integer DEFAULT 6;--> statement-breakpoint
ALTER TABLE `jobs` ADD `images_loop` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `jobs` ADD `images_quality` text DEFAULT '1k';--> statement-breakpoint
ALTER TABLE `jobs` ADD `captions_enabled` integer DEFAULT true;--> statement-breakpoint
ALTER TABLE `jobs` ADD `zoom_enabled` integer DEFAULT true;--> statement-breakpoint
ALTER TABLE `jobs` ADD `bg_music_artifact_id` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `auto_video_enabled` integer DEFAULT true;--> statement-breakpoint
ALTER TABLE `jobs` ADD `owner_user_id` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `created_by` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `priority_tier` text DEFAULT 'standard';--> statement-breakpoint
ALTER TABLE `jobs` ADD `queue_position` integer;--> statement-breakpoint
ALTER TABLE `jobs` ADD `eta_seconds` integer;--> statement-breakpoint
ALTER TABLE `jobs` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `voice_rate` text DEFAULT '0%';--> statement-breakpoint
ALTER TABLE `projects` ADD `voice_pitch` text DEFAULT '0%';--> statement-breakpoint
ALTER TABLE `projects` ADD `llm_temperature` real DEFAULT 0.7;--> statement-breakpoint
ALTER TABLE `projects` ADD `llm_max_tokens` integer DEFAULT 4096;--> statement-breakpoint
ALTER TABLE `projects` ADD `image_style_prefix` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `image_style_suffix` text;