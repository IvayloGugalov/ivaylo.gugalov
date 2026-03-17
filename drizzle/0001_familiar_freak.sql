ALTER TABLE "posts_meta" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "posts_meta" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;