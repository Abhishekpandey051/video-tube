import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema(
    {
        subscriber: {
            type: Schema.Types.ObjectId, // One who is suscribing
            ref: "User",
        },
        channel: {
            type: Schema.Types.ObjectId, // One to whom the suscriber is subscribing
            ref: "User",
        }
    },
    {
        timestamps: true,
    }
)

export const Subscription = mongoose.model("Subscription", subscriptionSchema);