import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Users } from "./Users";

@Index("connection_request_pkey", ["fromId", "toId"], { unique: true })
@Entity("connection_request", { schema: "public" })
export class ConnectionRequest {
  @Column("bigint", { primary: true, name: "from_id" })
  fromId: string;

  @Column("bigint", { primary: true, name: "to_id" })
  toId: string;

  @Column("timestamp with time zone", { name: "created_at" })
  createdAt: Date;

  @ManyToOne(() => Users, (users) => users.connectionRequests, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "from_id", referencedColumnName: "id" }])
  from: Users;

  @ManyToOne(() => Users, (users) => users.connectionRequests2, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "to_id", referencedColumnName: "id" }])
  to: Users;
}
