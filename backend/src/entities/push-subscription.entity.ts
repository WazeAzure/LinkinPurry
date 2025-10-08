import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./user.entity.js";

@Index("push_subscriptions_pkey", ["endpoint"], { unique: true })
@Entity("push_subscriptions", { schema: "public" })
export class PushSubscription {
  @Column("text", { primary: true, name: "endpoint" })
  endpoint: string;

  @Column("json", { name: "keys" })
  keys: object;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt: Date;

  @ManyToOne(() => User, (users) => users.pushSubscriptions, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
