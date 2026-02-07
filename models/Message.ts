import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface IMessage extends Document {
    sender: string;
    text: string;
    email: string;
    avatar?: string;
    timestamp: Date;
}

const MessageSchema = new Schema<IMessage>({
    sender: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const Message: Model<IMessage> = models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
