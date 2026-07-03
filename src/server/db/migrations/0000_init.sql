CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"budget" real,
	"status" text DEFAULT 'to_start' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patterns" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"source" text NOT NULL,
	"title" text,
	"pattern_number" text,
	"url" text,
	"image_url" text,
	"price" text,
	"price_paid" real,
	"purchased" smallint DEFAULT 0 NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "materials" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" text NOT NULL,
	"quantity" text,
	"price" real,
	"image_url" text,
	"notes" text,
	"care_instructions" text,
	"grain_direction" text,
	"pre_wash" smallint DEFAULT 0 NOT NULL,
	"purchased" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checklist_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"title" text NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"checked" smallint DEFAULT 0 NOT NULL,
	"image_urls" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "global_measurement_sets" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"measurements" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_global_measurement_sets" (
	"project_id" integer NOT NULL,
	"global_ms_id" integer NOT NULL,
	CONSTRAINT "project_global_measurement_sets_project_id_global_ms_id_pk" PRIMARY KEY("project_id","global_ms_id")
);
--> statement-breakpoint
CREATE TABLE "project_measurement_sets" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" text NOT NULL,
	"measurements" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "progress_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"url" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "patterns" ADD CONSTRAINT "patterns_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "materials_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_global_measurement_sets" ADD CONSTRAINT "project_global_measurement_sets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_global_measurement_sets" ADD CONSTRAINT "project_global_measurement_sets_global_ms_id_global_measurement_sets_id_fk" FOREIGN KEY ("global_ms_id") REFERENCES "public"."global_measurement_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_measurement_sets" ADD CONSTRAINT "project_measurement_sets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_images" ADD CONSTRAINT "progress_images_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;