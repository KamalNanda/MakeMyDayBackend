import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import db from './utilities/db/db.js' 
import swaggerUi from "swagger-ui-express";
import { Logger } from './utilities/logger.js'
import specs from './utilities/swaggerSetup.js'
import post_routes from './src/posts/routes/posts_route.js';
import TnsPostVsTag from './src/posts/models/tns_post_vs_tag.js';  
import TnsPostVsUser from './src/posts/models/tns_post_vs_users.js';
import contact_routes from './src/contact/routes/contact_routes.js';
import user_routes from './src/users/routes/user_routes.js';
import createUsersTable from './utilities/db/create_users_table.js';

export const app = express() 

app.use(cors())
app.use(bodyParser.json())
app.use("/api-docs/", swaggerUi.serve);
app.get("/api-docs/", swaggerUi.setup(specs));

app.use((req,res,next)=>{
    res.setHeader('Acces-Control-Allow-Origin','*');
    res.setHeader('Acces-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Acces-Contorl-Allow-Methods','Content-Type','Authorization');
    next(); 
})
app.use("/mmd/v1/posts", post_routes);
app.use("/mmd/v1/messages", contact_routes);
app.use("/mmd/v1/users", user_routes)

let port = process.env.PORT || 3000

// Initialize database tables
const initializeDatabase = async () => {
  try {
    // Create users table
    await createUsersTable();
    Logger().info('Database initialization completed');
  } catch (error) {
    Logger().error(`Database initialization failed: ${error.message}`);
  }
};

app.listen(port, async ()=>{
    Logger().info(`A Node.Js API is linstening on port 3000`)
    // Initialize database after server starts
    await initializeDatabase();
}) 

