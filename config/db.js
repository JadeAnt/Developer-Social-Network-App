const mongoose = require('mongoose'); //importing mongoose package
const config = require('config'); // importing config package
const db = config.get('mongoURI'); //getting the mongoURI string from default.json using config package

const connectDB = async () => {
    try{
        await mongoose.connect(db); //Connects to database, but awaits for it since it may take time

        console.log('MongoDB Connected...');
    }catch(err){
        console.error(err.message);
        process.exit(1); //wants to exit the process with failure
    }
}

module.exports = connectDB;