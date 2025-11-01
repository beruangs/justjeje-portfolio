import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  invoiceDate: {
    type: Date,
    required: true,
  },
  clientName: {
    type: String,
    required: true,
  },
  clientAddress: {
    type: String,
    default: '',
  },
  projectTitle: {
    type: String,
    required: true,
  },
  items: [{
    description: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    }
  }],
  subtotal: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['BELUM LUNAS', 'DP', 'LUNAS'],
    default: 'BELUM LUNAS',
  },
  dpAmount: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    default: '',
  },
  signature: {
    type: String, // Base64 image data
    default: null,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// Virtual untuk ID yang digunakan di frontend
invoiceSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialised
invoiceSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model('Invoice', invoiceSchema);
