import { connect } from 'mongoose';

const connectDB = async () => {
  await connect('mongodb://mongo:AQCnazcPAVXgkUBRZvFvPVlJPJsKADfi@acela.proxy.rlwy.net:10965')
  console.log('MongoDB conectado')
}

export default connectDB