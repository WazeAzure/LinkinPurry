import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Users } from "./Users";

@Index("feed_pkey", ["id"], { unique: true })
@Entity("feed", { schema: "public" })
export class Feed {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt: Date;

  @Column("timestamp with time zone", { name: "updated_at" })
  updatedAt: Date;

  @Column("text", { name: "content" })
  content: string;

  @ManyToOne(() => Users, (users) => users.feeds, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: Users;
}
