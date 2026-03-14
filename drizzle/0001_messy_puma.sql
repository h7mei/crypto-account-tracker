ALTER TABLE "user_preferences" ADD COLUMN "date_format" text DEFAULT 'MM/DD/YYYY';--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "price_alerts_enabled" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "show_portfolio_value" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "auto_sync_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "compact_view" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "show_percentage_colors" boolean DEFAULT true;