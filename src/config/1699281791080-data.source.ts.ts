import { MigrationInterface, QueryRunner } from "typeorm";

export class Data.source.ts1699281791080 implements MigrationInterface {
    name = 'Data.source.ts1699281791080'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "tx_hash" character varying NOT NULL, "from" character varying NOT NULL, "to" character varying NOT NULL, "amount" integer NOT NULL, "wallet_id" uuid, "network_id" uuid, CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "trade_orders_entity" ("order_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "balance" character varying NOT NULL, "price_per_unit" character varying NOT NULL, "currency_type" character varying NOT NULL, "trade_status" character varying NOT NULL, "seller_id" uuid, "buyer_id" uuid, CONSTRAINT "PK_9d0bdd45f11fb83f93e02cf171b" PRIMARY KEY ("order_id"))`);
        await queryRunner.query(`CREATE TABLE "sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_user_role_enum" AS ENUM('ADMIN', 'USER')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "phone_number" character varying NOT NULL, "encrypted_password" character varying NOT NULL, "user_role" "public"."users_user_role_enum" NOT NULL DEFAULT 'USER', CONSTRAINT "UQ_17d1817f241f10a3dbafb169fd2" UNIQUE ("phone_number"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "wallets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "balance" character varying NOT NULL DEFAULT '0', "address" character varying NOT NULL, "encrypted_private_key" character varying NOT NULL, "user_id" uuid, "network_id" uuid, CONSTRAINT "UQ_f907d5fd09a9d374f1da4e13bd3" UNIQUE ("address"), CONSTRAINT "UQ_bad169fd0c45150815e0e4a709e" UNIQUE ("encrypted_private_key"), CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "evm-tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "symbol" character varying NOT NULL, "contract_address" character varying NOT NULL, "wallet_id" uuid, "network_id" uuid, CONSTRAINT "PK_58cade1e9968d5e624c6efbfdf4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "evm-networks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "chain_id" character varying NOT NULL, CONSTRAINT "PK_48bbd94e3ce7d2fbc7287e64ec6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "to" text NOT NULL, "code" text NOT NULL, CONSTRAINT "PK_60793c2f16aafe0513f8817eae8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "one_time_token_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_cf0833a7ee31406a2d07a85a37c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_0b171330be0cb621f8d73b87a9e" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_a83b81f1a061d58427f79602a87" FOREIGN KEY ("network_id") REFERENCES "evm-networks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trade_orders_entity" ADD CONSTRAINT "FK_72835668cc9079917ba5b0bb405" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trade_orders_entity" ADD CONSTRAINT "FK_4fc1d53e66c403913bec33b2967" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "FK_92558c08091598f7a4439586cda" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "FK_73a72f664a4ca7b962be6bc0ee2" FOREIGN KEY ("network_id") REFERENCES "evm-networks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "evm-tokens" ADD CONSTRAINT "FK_0f09e1a8129949c2523b104fe36" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "evm-tokens" ADD CONSTRAINT "FK_41cc54773625a533c5d7676980b" FOREIGN KEY ("network_id") REFERENCES "evm-networks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "evm-tokens" DROP CONSTRAINT "FK_41cc54773625a533c5d7676980b"`);
        await queryRunner.query(`ALTER TABLE "evm-tokens" DROP CONSTRAINT "FK_0f09e1a8129949c2523b104fe36"`);
        await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT "FK_73a72f664a4ca7b962be6bc0ee2"`);
        await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT "FK_92558c08091598f7a4439586cda"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19"`);
        await queryRunner.query(`ALTER TABLE "trade_orders_entity" DROP CONSTRAINT "FK_4fc1d53e66c403913bec33b2967"`);
        await queryRunner.query(`ALTER TABLE "trade_orders_entity" DROP CONSTRAINT "FK_72835668cc9079917ba5b0bb405"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_a83b81f1a061d58427f79602a87"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_0b171330be0cb621f8d73b87a9e"`);
        await queryRunner.query(`DROP TABLE "one_time_token_entity"`);
        await queryRunner.query(`DROP TABLE "sms"`);
        await queryRunner.query(`DROP TABLE "evm-networks"`);
        await queryRunner.query(`DROP TABLE "evm-tokens"`);
        await queryRunner.query(`DROP TABLE "wallets"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_user_role_enum"`);
        await queryRunner.query(`DROP TABLE "sessions"`);
        await queryRunner.query(`DROP TABLE "trade_orders_entity"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
    }

}
