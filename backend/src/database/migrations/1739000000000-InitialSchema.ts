import { MigrationInterface, QueryRunner } from 'typeorm';

// Frozen schema snapshot; existing tables are never replaced or synchronized.
const schema = [
  {
    name: 'orders',
    sql: 'CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "public_id" character varying NOT NULL, "user_id" uuid NOT NULL, "application_id" uuid, "amount" numeric(12,2) NOT NULL, "payment_method" character varying NOT NULL DEFAULT \'bank\', "status" character varying NOT NULL DEFAULT \'pending\', "tracking_code" character varying, "courier" character varying, "est_delivery_at" TIMESTAMP WITH TIME ZONE, "delivery_status" character varying NOT NULL DEFAULT \'pending\', "shipped_at" TIMESTAMP WITH TIME ZONE, "delivered_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c545f013afea21ab10d0dc7b703" UNIQUE ("public_id"), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))',
    indexes: [],
    foreignKeys: [
      'ALTER TABLE "orders" ADD CONSTRAINT "FK_a922b820eeef29ac1c6800e826a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
      'ALTER TABLE "orders" ADD CONSTRAINT "FK_12c088d62c9d50743c9844b1148" FOREIGN KEY ("application_id") REFERENCES "coin_applications"("id") ON DELETE SET NULL ON UPDATE NO ACTION',
    ],
  },
  {
    name: 'coin_applications',
    sql: 'CREATE TABLE "coin_applications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "public_id" character varying NOT NULL, "user_id" uuid NOT NULL, "coin_type" character varying NOT NULL, "quantity" integer NOT NULL DEFAULT \'1\', "metal_purity" numeric(5,2) NOT NULL DEFAULT \'999\', "coin_value" numeric(12,2) NOT NULL, "price_quoted_at" TIMESTAMP WITH TIME ZONE, "status" character varying NOT NULL DEFAULT \'submitted\', "notes" text, "metal_type" character varying, "financing_preference" character varying, "financing_term_months" integer, "delivery_address" text, "additional_notes" text, "status_note" text, "crystal_sent" boolean NOT NULL DEFAULT false, "catalog_item_id" uuid, "design_author_id" uuid, "submitted_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_84a104f134f61339732b959abae" UNIQUE ("public_id"), CONSTRAINT "PK_3e7996e75d753126b537937b3ed" PRIMARY KEY ("id"))',
    indexes: [],
    foreignKeys: [
      'ALTER TABLE "coin_applications" ADD CONSTRAINT "FK_586707aa474a4ae103ff527075d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    ],
  },
  {
    name: 'users',
    sql: 'CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "phone" character varying, "password_hash" character varying NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "personal_id" character varying, "merge_id" character varying NOT NULL, "founder_id" character varying, "brand_line_id" character varying, "roles" jsonb NOT NULL DEFAULT \'["user"]\', "status" character varying NOT NULL DEFAULT \'active\', "kyc_status" character varying NOT NULL DEFAULT \'pending\', "avatar_url" character varying, "referred_by_id" uuid, "terms_accepted_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_1a49a7426bcf39a28fe68639a67" UNIQUE ("personal_id"), CONSTRAINT "UQ_7c6d090391e08c5860f93df8ecd" UNIQUE ("merge_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))',
    indexes: [],
    foreignKeys: [],
  },
  {
    name: 'metal_prices',
    sql: 'CREATE TABLE "metal_prices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "metal" character varying NOT NULL, "price_usd" numeric(12,4) NOT NULL, "change_pct" numeric(6,3) NOT NULL DEFAULT \'0\', "recorded_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_107947b8bbeb2548d5f177538ae" PRIMARY KEY ("id"))',
    indexes: [],
    foreignKeys: [],
  },
  {
    name: 'refresh_tokens',
    sql: 'CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "token" character varying NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4542dd2f38a61354a040ba9fd57" UNIQUE ("token"), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))',
    indexes: [],
    foreignKeys: [
      'ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    ],
  },
  {
    name: 'contact_messages',
    sql: 'CREATE TABLE "contact_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "subject" character varying NOT NULL, "message" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b74f96eb2edd977ccfba6533293" PRIMARY KEY ("id"))',
    indexes: [],
    foreignKeys: [],
  },
  {
    name: 'referrals',
    sql: 'CREATE TABLE "referrals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "referrer_id" uuid NOT NULL, "referred_user_id" character varying, "referred_name" character varying, "status" character varying NOT NULL DEFAULT \'pending\', "order_id" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ea9980e34f738b6252817326c08" PRIMARY KEY ("id"))',
    indexes: [],
    foreignKeys: [
      'ALTER TABLE "referrals" ADD CONSTRAINT "FK_18af9fcaffac6d6d3b28130e149" FOREIGN KEY ("referrer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    ],
  },
  {
    name: 'email_verification_codes',
    sql: 'CREATE TABLE "email_verification_codes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "code" character varying(6) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "used" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5bb1cbeebcbcb38996911bff8d4" PRIMARY KEY ("id"))',
    indexes: [],
    foreignKeys: [],
  },
  {
    name: 'password_reset_tokens',
    sql: 'CREATE TABLE "password_reset_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "token" character varying NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "used" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ab673f0e63eac966762155508ee" UNIQUE ("token"), CONSTRAINT "PK_d16bebd73e844c48bca50ff8d3d" PRIMARY KEY ("id"))',
    indexes: [],
    foreignKeys: [],
  },
  {
    name: 'notifications',
    sql: 'CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "type" character varying(64) NOT NULL, "title" character varying(255) NOT NULL, "body" text NOT NULL, "meta" jsonb, "read" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))',
    indexes: [],
    foreignKeys: [
      'ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    ],
  },
  {
    name: 'kyc_documents',
    sql: 'CREATE TABLE "kyc_documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "original_name" character varying NOT NULL, "mime_type" character varying(128) NOT NULL, "size" integer NOT NULL, "file_path" character varying NOT NULL, "document_type" character varying(32) NOT NULL DEFAULT \'other\', "status" character varying NOT NULL DEFAULT \'pending\', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_02e49877f1578e6285f84e57ab6" PRIMARY KEY ("id"))',
    indexes: [],
    foreignKeys: [
      'ALTER TABLE "kyc_documents" ADD CONSTRAINT "FK_83d1e7b68c12df09ba0e272c1a5" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    ],
  },
  {
    name: 'catalog_items',
    sql: 'CREATE TABLE "catalog_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "collection_id" uuid NOT NULL, "title" character varying NOT NULL, "description" text, "metal_type" character varying, "image_url" character varying, "model3d_url" character varying, "model3d_format" character varying, "status" character varying NOT NULL DEFAULT \'ACTIVE\', "price_usd" numeric(14,2), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_dd1c29828c10a599d894b9b6535" PRIMARY KEY ("id"))',
    indexes: [],
    foreignKeys: [
      'ALTER TABLE "catalog_items" ADD CONSTRAINT "FK_ce06dd6e95ae37a8a7d15dcfbf1" FOREIGN KEY ("collection_id") REFERENCES "catalog_collections"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    ],
  },
  {
    name: 'catalog_collections',
    sql: 'CREATE TABLE "catalog_collections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "title" character varying NOT NULL, "description" text, "slug" character varying NOT NULL, "visibility" character varying NOT NULL DEFAULT \'PRIVATE\', "category" character varying(32) NOT NULL DEFAULT \'more\', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e7f855035651eadc2a39014f3de" UNIQUE ("slug"), CONSTRAINT "PK_dc6f90fcc582cbb77f7d6059fe9" PRIMARY KEY ("id"))',
    indexes: [],
    foreignKeys: [
      'ALTER TABLE "catalog_collections" ADD CONSTRAINT "FK_431c499bea20a892d1efd57ed5b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    ],
  },
  {
    name: 'brand_line_profiles',
    sql: 'CREATE TABLE "brand_line_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "name" character varying, "description" text, "logo_url" character varying, "profile_views" integer NOT NULL DEFAULT \'0\', "qr_scans" integer NOT NULL DEFAULT \'0\', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_91faf73587b781ec7acb190ca59" UNIQUE ("user_id"), CONSTRAINT "REL_91faf73587b781ec7acb190ca5" UNIQUE ("user_id"), CONSTRAINT "PK_af9f50a31f692129942acf4d3d1" PRIMARY KEY ("id"))',
    indexes: [],
    foreignKeys: [
      'ALTER TABLE "brand_line_profiles" ADD CONSTRAINT "FK_91faf73587b781ec7acb190ca59" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    ],
  },
  {
    name: 'platform_settings',
    sql: 'CREATE TABLE "platform_settings" ("id" integer NOT NULL DEFAULT \'1\', "ticker_enabled" boolean NOT NULL DEFAULT true, "ai_enabled" boolean NOT NULL DEFAULT true, "auto_verify" boolean NOT NULL DEFAULT false, "platform_share" character varying NOT NULL DEFAULT \'1/2\', "brand_share" character varying NOT NULL DEFAULT \'1/4\', "referrer_share" character varying NOT NULL DEFAULT \'1/4\', "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2934aeb70ec285196dcab4a2e96" PRIMARY KEY ("id"))',
    indexes: [],
    foreignKeys: [],
  },
  {
    name: 'phone_verification_codes',
    sql: 'CREATE TABLE "phone_verification_codes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "phone" character varying NOT NULL, "code" character varying(6) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "used" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b279f888c7b835cd371d69d95fa" PRIMARY KEY ("id"))',
    indexes: [],
    foreignKeys: [],
  },
  {
    name: 'wallet_transactions',
    sql: 'CREATE TABLE "wallet_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "type" character varying(16) NOT NULL, "amount" numeric(14,2) NOT NULL, "balance_after" numeric(14,2) NOT NULL, "reason" character varying(64) NOT NULL, "note" character varying(255), "order_id" uuid, "created_by" uuid, "meta" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5120f131bde2cda940ec1a621db" PRIMARY KEY ("id"))',
    indexes: [
      'CREATE INDEX "IDX_4796762c619893704abbc3dce6" ON "wallet_transactions"  ("user_id") ',
    ],
    foreignKeys: [
      'ALTER TABLE "wallet_transactions" ADD CONSTRAINT "FK_4796762c619893704abbc3dce65" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    ],
  },
  {
    name: 'catalog_orders',
    sql: 'CREATE TABLE "catalog_orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "public_id" character varying NOT NULL, "buyer_id" uuid NOT NULL, "seller_id" uuid NOT NULL, "item_id" uuid NOT NULL, "collection_id" uuid NOT NULL, "item_title" character varying(160) NOT NULL, "amount" numeric(14,2) NOT NULL, "seller_earnings" numeric(14,2) NOT NULL, "brand_share_label" character varying(32) NOT NULL, "status" character varying(32) NOT NULL DEFAULT \'paid\', "meta" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b2440195c35e3c324e7f0772f69" UNIQUE ("public_id"), CONSTRAINT "PK_05d805bb3aac467a04826f885fd" PRIMARY KEY ("id"))',
    indexes: [
      'CREATE INDEX "IDX_db551494bfc31a2dbca45d5348" ON "catalog_orders"  ("buyer_id") ',
      'CREATE INDEX "IDX_e129ad2cfa22a90e55c6fd0411" ON "catalog_orders"  ("seller_id") ',
    ],
    foreignKeys: [
      'ALTER TABLE "catalog_orders" ADD CONSTRAINT "FK_db551494bfc31a2dbca45d53488" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
      'ALTER TABLE "catalog_orders" ADD CONSTRAINT "FK_e129ad2cfa22a90e55c6fd04117" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
      'ALTER TABLE "catalog_orders" ADD CONSTRAINT "FK_5c2284f5abcaa8f91df6b0bb801" FOREIGN KEY ("item_id") REFERENCES "catalog_items"("id") ON DELETE SET NULL ON UPDATE NO ACTION',
      'ALTER TABLE "catalog_orders" ADD CONSTRAINT "FK_2a64272be40d21fcf24dd18153b" FOREIGN KEY ("collection_id") REFERENCES "catalog_collections"("id") ON DELETE SET NULL ON UPDATE NO ACTION',
    ],
  },
];

export class InitialSchema1739000000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    const created = new Set<string>();
    for (const table of schema) {
      if (await queryRunner.hasTable(table.name)) continue;
      await queryRunner.query(table.sql);
      created.add(table.name);
      for (const sql of table.indexes) await queryRunner.query(sql);
    }
    for (const table of schema) {
      if (!created.has(table.name)) continue;
      for (const sql of table.foreignKeys) await queryRunner.query(sql);
    }
  }
  async down(): Promise<void> {
    throw new Error(
      'Initial schema cannot be dropped automatically. Restore a verified backup instead.',
    );
  }
}
