CREATE TABLE `artifacts` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`step_key` text NOT NULL,
	`type` text NOT NULL,
	`path` text NOT NULL,
	`filename` text NOT NULL,
	`checksum` text,
	`size_bytes` integer,
	`version` integer DEFAULT 1 NOT NULL,
	`metadata` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`actor` text DEFAULT 'admin' NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`entity_name` text,
	`scope` text,
	`project_id` text,
	`before_json` text,
	`after_json` text,
	`metadata` text
);
--> statement-breakpoint
CREATE TABLE `execution_bindings` (
	`id` text PRIMARY KEY NOT NULL,
	`scope` text DEFAULT 'global' NOT NULL,
	`project_id` text,
	`recipe_id` text NOT NULL,
	`step_key` text NOT NULL,
	`slot` text NOT NULL,
	`target_id` text NOT NULL,
	`priority` integer DEFAULT 0,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `job_steps` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`step_key` text NOT NULL,
	`step_order` integer NOT NULL,
	`input_hash` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`output_refs` text,
	`logs` text,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_error` text,
	`duration_ms` integer,
	`started_at` text,
	`completed_at` text
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`recipe_id` text NOT NULL,
	`recipe_slug` text NOT NULL,
	`recipe_version` integer NOT NULL,
	`input` text NOT NULL,
	`manifest` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`current_step` text,
	`progress` integer DEFAULT 0,
	`last_error` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`started_at` text,
	`completed_at` text,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `knowledge_base` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`tier` text NOT NULL,
	`category` text NOT NULL,
	`content` text NOT NULL,
	`recipe_slug` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `knowledge_base_slug_unique` ON `knowledge_base` (`slug`);--> statement-breakpoint
CREATE TABLE `presets` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`type` text NOT NULL,
	`config` text NOT NULL,
	`tags` text,
	`version` integer DEFAULT 1 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `presets_slug_unique` ON `presets` (`slug`);--> statement-breakpoint
CREATE TABLE `presets_effects` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`filtergraph` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`enabled_by_default` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `presets_effects_slug_unique` ON `presets_effects` (`slug`);--> statement-breakpoint
CREATE TABLE `presets_ssml` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`pause_mappings` text NOT NULL,
	`voice_mappings` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `presets_ssml_slug_unique` ON `presets_ssml` (`slug`);--> statement-breakpoint
CREATE TABLE `presets_video` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`encoder` text DEFAULT 'h264_videotoolbox' NOT NULL,
	`scale` text DEFAULT '1280:720' NOT NULL,
	`fps` integer DEFAULT 30 NOT NULL,
	`bitrate` text DEFAULT '4M' NOT NULL,
	`pixel_format` text DEFAULT 'yuv420p' NOT NULL,
	`audio_codec` text DEFAULT 'aac' NOT NULL,
	`audio_bitrate` text DEFAULT '192k' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `presets_video_slug_unique` ON `presets_video` (`slug`);--> statement-breakpoint
CREATE TABLE `presets_voice` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`voice_name` text NOT NULL,
	`language` text DEFAULT 'es-MX' NOT NULL,
	`rate` real DEFAULT 1 NOT NULL,
	`pitch` text DEFAULT '0%' NOT NULL,
	`volume` text DEFAULT 'default' NOT NULL,
	`style` text,
	`style_degree` real DEFAULT 1,
	`role` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `presets_voice_slug_unique` ON `presets_voice` (`slug`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_key_unique` ON `projects` (`key`);--> statement-breakpoint
CREATE TABLE `prompts` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`description` text,
	`system_prompt` text,
	`user_template` text NOT NULL,
	`model` text DEFAULT 'claude-sonnet-4-20250514' NOT NULL,
	`max_tokens` integer DEFAULT 4096 NOT NULL,
	`temperature` real DEFAULT 0.7 NOT NULL,
	`kb_tiers` text,
	`version` integer DEFAULT 1 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `prompts_slug_unique` ON `prompts` (`slug`);--> statement-breakpoint
CREATE TABLE `providers` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`default_model` text,
	`base_url` text,
	`config` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `providers_slug_unique` ON `providers` (`slug`);--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`pipeline` text NOT NULL,
	`default_voice_preset_slug` text,
	`default_video_preset_slug` text,
	`validators_config` text,
	`version` integer DEFAULT 1 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `recipes_slug_unique` ON `recipes` (`slug`);--> statement-breakpoint
CREATE TABLE `validators` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`type` text NOT NULL,
	`config` text NOT NULL,
	`error_message` text NOT NULL,
	`severity` text DEFAULT 'error' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `validators_slug_unique` ON `validators` (`slug`);