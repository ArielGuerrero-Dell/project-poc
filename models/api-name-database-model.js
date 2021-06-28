import mongoose from 'mongoose';
const Schema = mongoose.Schema;
/**
 * Create database scheme for api Names
 */
const ApiNameSchema = new Schema({
    isValid: String,
    query: String,
    sugesstedQuery: String,
    associatedProducts: []
});

export default mongoose.model('apiName', ApiNameSchema);