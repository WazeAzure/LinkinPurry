import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity.js";

@Index("chat_pkey", ["id"], { unique: true })
@Entity("chat", { schema: "public" })
export class Chat {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", nullable: false})
  id: string;

  @Column("timestamp with time zone", {
    name: "timestamp",
    default: () => "now()",
  })
  timestamp: Date;

  @Column("text", { name: "message" })
  message: string;

  @ManyToOne(() => User, (users) => users.chats, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "from_id", referencedColumnName: "id" }])
  from: User;

  @ManyToOne(() => User, (users) => users.chats2, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "to_id", referencedColumnName: "id" }])
  to: User;
}
