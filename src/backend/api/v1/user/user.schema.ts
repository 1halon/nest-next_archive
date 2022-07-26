import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';

@Schema()
export class User {
  @Prop({
    default: Date.now,
    immutable: !!1,
    //required: true,
    type: Number,
  })
  created_at: number;
  @Prop({ maxlength: 64, minlength: 4, type: String })
  display_name: string;
  @Prop({
    match:
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    lowercase: !!1,
    required: !!1,
    trim: !!1,
    type: String,
  })
  email: string;
  @Prop({
    default: () => randomUUID().split('-').join(''),
    immutable: !!1,
    match: /^[0-9a-f]{8}[0-9a-f]{4}[0-9a-f]{4}[0-9a-f]{4}[0-9a-f]{12}$/,
    //required: !!1,
    type: String,
    unique: !!1,
  })
  id: string;
  @Prop({
    default: 'None',
    enum: ['None', 'Basic', 'Standart', 'Advanced', 'Custom'],
    type: String,
  })
  premium: string;
  @Prop({
    required: !!1,
    type: String,
    unique: !!1,
  })
  token: string;
  @Prop({
    immutable: !!1,
    maxlength: 64,
    minlength: 4,
    required: !!1,
    type: String,
    unique: !!1,
  })
  username: string;
}

const UserSchema = SchemaFactory.createForClass(User);

export default UserSchema;
