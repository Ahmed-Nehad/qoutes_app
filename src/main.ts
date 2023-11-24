import express, { Application } from 'express';
import getMysqlDS from './repositories/mySql';
import getUserRoute from './routes/userRoute';
import errorHandler, {errorHandler404} from './middlewares/errorHandler';
import { initEmailList } from './services/emailList';
import startSending from './services/scheduleService';

const app = express();
try{
    const mysqlPool = getMysqlDS();

    app.use(express.json());
    
    if(process.env.NODE_ENV !== 'test'){
        initEmailList(mysqlPool).then( () => startSending(mysqlPool, 6) );
    }


    const user_router = getUserRoute(mysqlPool);
    app.use('/api/users', user_router);

    app.use(
        errorHandler404, // check the 404 error
        errorHandler // check for other not processed errors
        )
        
} catch(error){
    console.error('an unknown error happened in the server:');
    console.error(error)
}

export default app;