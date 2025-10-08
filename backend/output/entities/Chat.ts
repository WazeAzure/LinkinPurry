import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Users } from "./Users";

@Index("chat_pkey", ["id"], { unique: true })
@Entity("chat", { schema: "public" })
export class Chat {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("timestamp with time zone", {
    name: "timestamp",
    default: () => "now()",
  })
  timestamp: Date;

  @Column("text", { name: "message" })
  message: string;

  @ManyToOne(() => Users, (users) => users.chats, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "from_id", referencedColumnName: "id" }])
  from: Users;

  @ManyToOne(() => Users, (users) => users.chats2, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "to_id", referencedColumnName: "id" }])
  to: Users;
}
