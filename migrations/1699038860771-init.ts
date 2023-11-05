import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1699038860771 implements MigrationInterface {
    name = 'Init1699038860771'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "tx_hash" character varying NOT NULL, "from" character varying NOT NULL, "to" character varying NOT NULL, "amount" integer NOT NULL, "wallet_id" uuid, "network_id" uuid, CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "evm-tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "symbol" character varying NOT NULL, "contract_address" character varying NOT NULL, "wallet_id" uuid, "network_id" uuid, CONSTRAINT "PK_58cade1e9968d5e624c6efbfdf4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "evm-networks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" NOT NULL, "chain_id" character varying NOT NULL, CONSTRAINT "PK_48bbd94e3ce7d2fbc7287e64ec6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "wallets" ALTER COLUMN "balance" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_0b171330be0cb621f8d73b87a9e" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_a83b81f1a061d58427f79602a87" FOREIGN KEY ("network_id") REFERENCES "evm-networks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "evm-tokens" ADD CONSTRAINT "FK_0f09e1a8129949c2523b104fe36" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "evm-tokens" ADD CONSTRAINT "FK_41cc54773625a533c5d7676980b" FOREIGN KEY ("network_id") REFERENCES "evm-networks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "FK_73a72f664a4ca7b962be6bc0ee2" FOREIGN KEY ("network_id") REFERENCES "evm-networks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT "FK_73a72f664a4ca7b962be6bc0ee2"`);
        await queryRunner.query(`ALTER TABLE "evm-tokens" DROP CONSTRAINT "FK_41cc54773625a533c5d7676980b"`);
        await queryRunner.query(`ALTER TABLE "evm-tokens" DROP CONSTRAINT "FK_0f09e1a8129949c2523b104fe36"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_a83b81f1a061d58427f79602a87"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_0b171330be0cb621f8d73b87a9e"`);
        await queryRunner.query(`ALTER TABLE "wallets" ALTER COLUMN "balance" DROP DEFAULT`);
        await queryRunner.query(`DROP TABLE "evm-networks"`);
        await queryRunner.query(`DROP TABLE "evm-tokens"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
    }

}
