import mongoose, { Model } from "mongoose";
import { Document, model, models, Schema } from "mongoose";

interface UserSchemaType extends Document {
  name: string;
  email: string;
  photoURL: string;
  friends: Array<mongoose.Types.ObjectId>;
  pendingRequests: Array<mongoose.Types.ObjectId>;
  joiningDate: Date;
  savedAsteroids: Array<object>;
}

const UserSchema = new Schema<UserSchemaType>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  photoURL: {
    type: String,
    required: true,
  },
  joiningDate: {
    type: Date,
    default: Date.now,
  },
  savedAsteroids:{
    type:[],
  }
});

const User =
  (models.User as Model<UserSchemaType>) ||
  model<UserSchemaType>("User", UserSchema);
export default User;
