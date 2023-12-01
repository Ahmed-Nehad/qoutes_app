import express, { Application } from 'express';
import getMysqlDS from './repositories/mySql';
import getUserRoute from './routes/userRoute';
import errorHandler, {errorHandler404} from './middlewares/errorHandler';
import { initEmailList } from './services/emailList';
import startSending from './services/scheduleService';
import getQuotesRoute from './routes/quotesRoute';

const app = express();

const mysqlPool = getMysqlDS();

app.use(express.json());

if(process.env.NODE_ENV !== 'test'){
    initEmailList(mysqlPool).then( () => startSending(mysqlPool, 6) );
}

app.use('/api/v1/users', getUserRoute(mysqlPool));

app.use('/api/v1/quotes', getQuotesRoute(mysqlPool));

app.use(
    errorHandler404, // check the 404 error
    errorHandler // check for other not processed errors
    )
        
export default app;