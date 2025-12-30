import mongoose from 'mongoose';

mongoose.connect('mongodb+srv://Aravind:Aravind%402041@cluster0.ykz5b.mongodb.net/Akvora_Webiners')
  .then(async () => {
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('Users found:', users.length);
    users.forEach(user => {
      console.log('User:', { email: user.email, role: user.role, hasPassword: !!user.password });
    });
    
    mongoose.disconnect();
  })
  .catch(console.error);
