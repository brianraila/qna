// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import faunadb, {query as q} from 'faunadb';
const client = new faunadb.Client({secret: process.env.FAUNA_SECRET })


export default async (req, res) => {

    if(req.method == 'POST'){
        let {question_text, correct_answer, options } = req.body
        if (!(question_text && correct_answer && options)){
            res.json({ error: "Fields question_text, correct_answer, options should be provided." })
        }
        else{
            let results = await client.query(
                    q.Create(q.Collection('questions'), 
                        { data : {question_text, correct_answer, options}})
                )
            console.log(results)
            res.json({ id: results.ref.id, data: results.data })
        }
    }
  }
  