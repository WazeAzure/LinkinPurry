import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Chat } from "./Chat";
import { Connection } from "./Connection";
import { ConnectionRequest } from "./ConnectionRequest";
import { Feed } from "./Feed";
import { PushSubscriptions } from "./PushSubscriptions";

@Index("users_email_key", ["email"], { unique: true })
@Index("users_pkey", ["id"], { unique: true })
@Index("users_username_key", ["username"], { unique: true })
@Entity("users", { schema: "public" })
export class Users {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("character varying", { name: "username", unique: true, length: 255 })
  username: string;

  @Column("character varying", { name: "email", unique: true, length: 255 })
  email: string;

  @Column("character varying", { name: "password_hash", length: 255 })
  passwordHash: string;

  @Column("character varying", {
    name: "full_name",
    nullable: true,
    length: 255,
  })
  fullName: string | null;

  @Column("text", { name: "work_history", nullable: true })
  workHistory: string | null;

  @Column("text", { name: "skills", nullable: true })
  skills: string | null;

  @Column("character varying", { name: "profile_photo_path", length: 255 })
  profilePhotoPath: string;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt: Date;

  @Column("timestamp with time zone", { name: "updated_at" })
  updatedAt: Date;

  @OneToMany(() => Chat, (chat) => chat.from)
  chats: Chat[];

  @OneToMany(() => Chat, (chat) => chat.to)
  chats2: Chat[];

  @OneToMany(() => Connection, (connection) => connection.from)
  connections: Connection[];

  @OneToMany(() => Connection, (connection) => connection.to)
  connections2: Connection[];

  @OneToMany(
    () => ConnectionRequest,
    (connectionRequest) => connectionRequest.from
  )
  connectionRequests: ConnectionRequest[];

  @OneToMany(
    () => ConnectionRequest,
    (connectionRequest) => connectionRequest.to
  )
  connectionRequests2: ConnectionRequest[];

  @OneToMany(() => Feed, (feed) => feed.user)
  feeds: Feed[];

  @OneToMany(
    () => PushSubscriptions,
    (pushSubscriptions) => pushSubscriptions.user
  )
  pushSubscriptions: PushSubscriptions[];
}
