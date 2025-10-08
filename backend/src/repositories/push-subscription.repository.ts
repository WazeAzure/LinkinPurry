import { BaseRepository } from "./base.repository.js";
import { PushSubscription } from "../entities/push-subscription.entity.js";
import { FindOptionsWhere } from 'typeorm';

export class PushSubscriptionRepository extends BaseRepository<PushSubscription> {
    constructor() {
        super(PushSubscription);
    }
}