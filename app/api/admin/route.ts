import {db,user,json,fail} from '@/lib/server';
export async function GET(req:Request){try{await user(req,'admin');const u=await db().prepare("SELECT first_name,business,email,phone,created_at FROM users WHERE role='user' ORDER BY created_at DESC").all();return json({users:u.results,total:u.results.length})}catch(e){return fail(e)}}
